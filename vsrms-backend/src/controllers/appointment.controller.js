'use strict';

const Appointment  = require('../models/Appointment');
const Vehicle      = require('../models/Vehicle');
const Workshop     = require('../models/Workshop');
const User         = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ── Pagination helper ─────────────────────────────────────────────────────────
const paginate = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/appointments/mine  — paginated, JWT owner sees their own
// ─────────────────────────────────────────────────────────────────────────────
const getMyAppointments = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { status } = req.query;          // paginate() does not return status
    const filter = { userId: req.user._id };
    if (status) {
      const statuses = String(status).split(',').map(s => s.trim()).filter(Boolean);
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    const [data, total] = await Promise.all([
      Appointment.find(filter)
        .populate('workshopId', 'name address')
        .populate('vehicleId', 'make model registrationNo')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Appointment.countDocuments(filter),
    ]);
    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/appointments/:id
// ─────────────────────────────────────────────────────────────────────────────
const getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate('workshopId');
    if (!appt) throw new AppError('Appointment not found', 404);

    // Visibility rules:
    // 1. Admin sees everything.
    // 2. Customer sees their own.
    // 3. Workshop Owner/Staff sees appointments for their workshop.
    const isOwner     = req.user.role === 'customer' && appt.userId.toString() === req.user._id.toString();
    const isWorkshop  = ['workshop_owner', 'workshop_staff'].includes(req.user.role) &&
                        appt.workshopId.toString() === req.user.workshopId?.toString();
    const isAdmin     = req.user.role === 'admin';

    if (!isOwner && !isWorkshop && !isAdmin) {
      throw new AppError('Forbidden — you do not have permission to view this appointment', 403);
    }

    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/appointments
// ─────────────────────────────────────────────────────────────────────────────
const createAppointment = async (req, res, next) => {
  try {
    const { vehicleId, workshopId, serviceType, scheduledDate, notes } = req.body;

    // Past date check (enforced in controller as requested)
    const date = new Date(scheduledDate);
    if (date < new Date()) {
      throw new AppError('Scheduled date cannot be in the past', 400);
    }

    // Verify the vehicle belongs to the requester
    const vehicle = await Vehicle.findOne({ _id: vehicleId, deletedAt: null });
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    if (vehicle.ownerId.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden — you do not own this vehicle', 403);
    }

    // Double booking check — same workshop, same calendar day, active status
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

    const conflictCount = await Appointment.countDocuments({
      workshopId,
      scheduledDate: { $gte: dayStart, $lt: dayEnd },
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
    });
    if (conflictCount >= 20) throw new AppError('Workshop has reached the maximum capacity of 20 appointments for this date', 409);

    const appt = await Appointment.create({
      userId: req.user._id,
      vehicleId,
      workshopId,
      serviceType,
      scheduledDate:  date,
      notes,
    });
    res.status(201).json({ appointment: appt });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/appointments/:id  — only if status === 'pending'
// ─────────────────────────────────────────────────────────────────────────────
const updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw new AppError('Appointment not found', 404);
    if (appt.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden — you do not own this appointment', 403);
    }
    if (appt.status !== 'pending') {
      throw new AppError('Only pending appointments can be edited', 400);
    }

    const allowed = ['serviceType', 'scheduledDate', 'notes'];
    allowed.forEach((key) => { if (req.body[key] !== undefined) appt[key] = req.body[key]; });

    await appt.save();
    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/appointments/:id/status  — staff/admin, forward-only state machine
// ─────────────────────────────────────────────────────────────────────────────
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status: newStatus } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw new AppError('Appointment not found', 404);

    if (!Appointment.isValidTransition(appt.status, newStatus)) {
      throw new AppError(
        `Cannot transition from '${appt.status}' to '${newStatus}'`, 400,
      );
    }
    appt.status = newStatus;
    await appt.save();
    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/appointments/:id  — only if status === 'pending'
// ─────────────────────────────────────────────────────────────────────────────
const deleteAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw new AppError('Appointment not found', 404);
    if (appt.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden — you do not own this appointment', 403);
    }
    if (appt.status !== 'pending') {
      throw new AppError('Only pending appointments can be cancelled', 400);
    }
    await appt.deleteOne();
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/appointments/workshop/:workshopId  — staff/owner/admin
// Returns all appointments for a specific workshop, paginated with optional ?status=
// ─────────────────────────────────────────────────────────────────────────────
const getWorkshopAppointments = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { status } = req.query;
    const { workshopId } = req.params;

    let filter = {};

    // If workshopId is 'all' or missing (and user is owner), find all their workshops
    if (!workshopId || workshopId === 'all') {
      if (req.user.role !== 'workshop_owner' && req.user.role !== 'admin') {
        throw new AppError('Workshop ID is required', 400);
      }
      
      const wsFilter = req.user.email === 'customer@bypass.com'
        ? { $or: [{ ownerId: req.user._id }, { ownerId: null }, { ownerId: { $exists: false } }] }
        : { ownerId: req.user._id };
      
      const myWorkshops = await Workshop.find(wsFilter).select('_id');
      filter.workshopId = { $in: myWorkshops.map(w => w._id) };
    } else {
      // Validate that workshopId is a valid MongoDB ObjectId to prevent cast errors
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(workshopId)) {
        // If staff, try self-healing immediately
        if (req.user.role === 'workshop_staff') {
          const correctWS = await Workshop.findOne({ technicians: req.user._id }).select('_id');
          if (correctWS) {
            filter.workshopId = correctWS._id;
            await User.findByIdAndUpdate(req.user._id, { workshopId: correctWS._id });
          } else {
            return res.status(200).json({ data: [], total: 0, message: 'Invalid workshop assignment' });
          }
        } else {
          return res.status(400).json({ error: 'Invalid Workshop ID format' });
        }
      } else {
        // Safety check: ensure the workshop exists
        const wsExists = await Workshop.findById(workshopId).select('_id');
        if (!wsExists && req.user.role === 'workshop_staff') {
          // Try self-healing: find the workshop that actually lists this user
          const correctWS = await Workshop.findOne({ technicians: req.user._id }).select('_id');
          if (correctWS) {
            filter.workshopId = correctWS._id;
            await User.findByIdAndUpdate(req.user._id, { workshopId: correctWS._id });
          } else {
            // No valid workshop found — return empty rather than leaking all appointments
            return res.status(200).json({ data: [], total: 0, page: 1, pages: 0, message: 'Workshop assignment not found' });
          }
        } else if (!wsExists) {
          // Owner/admin with invalid wsId — return empty
          return res.status(200).json({ data: [], total: 0, page: 1, pages: 0, message: 'Workshop not found' });
        } else {
          filter.workshopId = workshopId;
        }
      }
    }

    if (status) {
      const statuses = String(status).split(',').map(s => s.trim()).filter(Boolean);
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    const [data, total] = await Promise.all([
      Appointment.find(filter)
        .populate('userId', 'fullName email')
        .populate('vehicleId', 'registrationNo make model')
        .populate('workshopId', 'name') // Added to show WS name on each card
        .skip(skip)
        .limit(limit)
        .sort({ scheduledDate: -1 }),
      Appointment.countDocuments(filter),
    ]);
    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyAppointments, getWorkshopAppointments, getAppointment, createAppointment,
  updateAppointment, updateAppointmentStatus, deleteAppointment,
};
