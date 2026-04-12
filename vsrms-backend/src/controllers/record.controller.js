'use strict';

const ServiceRecord = require('../models/ServiceRecord');
const Vehicle       = require('../models/Vehicle');
const Appointment   = require('../models/Appointment');
const { AppError }  = require('../middleware/errorHandler');

// ── Pagination helper ─────────────────────────────────────────────────────────
const paginate = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

// ── Ownership helper — owners can only access their own vehicles' records ─────
const assertVehicleOwnership = async (vehicleId, userId, role) => {
  const vehicle = await Vehicle.findOne({ _id: vehicleId, deletedAt: null });
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  // Visibility:
  // 1. Customer can only see their own vehicles
  // 2. Staff/Owner/Admin can see any (to manage records)
  if (role === 'customer' && vehicle.ownerId.toString() !== userId.toString()) {
    throw new AppError('Forbidden — you do not own this vehicle', 403);
  }
  return vehicle;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/records/vehicle/:vehicleId  — JWT, ownership enforced for owners
// ─────────────────────────────────────────────────────────────────────────────
const getRecordsByVehicle = async (req, res, next) => {
  try {
    await assertVehicleOwnership(req.params.vehicleId, req.user._id, req.user.role);
    const { page, limit, skip } = paginate(req.query);
    const filter = { vehicleId: req.params.vehicleId };

    const [data, total] = await Promise.all([
      ServiceRecord.find(filter).skip(skip).limit(limit).sort({ serviceDate: -1 }),
      ServiceRecord.countDocuments(filter),
    ]);
    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/records/:id  — JWT, vehicle ownership enforced
// ─────────────────────────────────────────────────────────────────────────────
const getRecord = async (req, res, next) => {
  try {
    const record = await ServiceRecord.findById(req.params.id);
    if (!record) throw new AppError('Service record not found', 404);

    await assertVehicleOwnership(record.vehicleId, req.user._id, req.user.role);
    res.json({ record });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/records  — staff only
// ─────────────────────────────────────────────────────────────────────────────
const createRecord = async (req, res, next) => {
  try {
    const { vehicleId, appointmentId, serviceDate, workDone, partsReplaced, totalCost, mileageAtService, technicianName } = req.body;

    // Verify the vehicle exists (staff can create for any vehicle)
    const vehicle = await Vehicle.findOne({ _id: vehicleId, deletedAt: null });
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const record = await ServiceRecord.create({
      vehicleId,
      appointmentId,
      serviceDate,
      workDone,
      partsReplaced: partsReplaced || [],
      totalCost,
      mileageAtService,
      technicianName,
    });
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/records/:id  — staff only
// ─────────────────────────────────────────────────────────────────────────────
const updateRecord = async (req, res, next) => {
  try {
    const record = await ServiceRecord.findById(req.params.id);
    if (!record) throw new AppError('Service record not found', 404);

    const allowed = ['serviceDate', 'workDone', 'partsReplaced', 'totalCost', 'mileageAtService', 'technicianName'];
    allowed.forEach((key) => { if (req.body[key] !== undefined) record[key] = req.body[key]; });

    await record.save();
    res.json({ record });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/records/:id  — admin only (hard delete)
// ─────────────────────────────────────────────────────────────────────────────
const deleteRecord = async (req, res, next) => {
  try {
    const record = await ServiceRecord.findByIdAndDelete(req.params.id);
    if (!record) throw new AppError('Service record not found', 404);
    res.json({ message: 'Service record deleted' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/records/workshop/:workshopId — owner/staff/admin: all records for a workshop
// ─────────────────────────────────────────────────────────────────────────────
const getWorkshopRecords = async (req, res, next) => {
  try {
    const { workshopId } = req.params;
    const role = req.user.role;

    // Workshop owners can only see their own workshop's records
    if (role === 'workshop_owner' && req.user.workshopId?.toString() !== workshopId) {
      throw new AppError('Forbidden — this is not your workshop', 403);
    }

    const { page, limit, skip } = paginate(req.query);

    // Find all appointment IDs for this workshop
    const appointments = await Appointment.find({ workshopId }).select('_id');
    const appointmentIds = appointments.map(a => a._id);

    const filter = { appointmentId: { $in: appointmentIds } };
    const [data, total] = await Promise.all([
      ServiceRecord.find(filter)
        .populate('vehicleId', 'make model registrationNo vehicleType')
        .populate('appointmentId', 'serviceType scheduledDate status')
        .skip(skip).limit(limit).sort({ serviceDate: -1 }),
      ServiceRecord.countDocuments(filter),
    ]);

    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecordsByVehicle, getRecord, createRecord, updateRecord, deleteRecord, getWorkshopRecords };
