'use strict';

const multer               = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const Workshop             = require('../models/Workshop');
const { r2Client, R2_BUCKET, R2_PUBLIC_URL } = require('../config/r2');
const { AppError }         = require('../middleware/errorHandler');

// ── Multer setup ─────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new AppError('Only JPEG and PNG files are allowed', 400));
    }
    cb(null, true);
  },
});

// ── Pagination helper ─────────────────────────────────────────────────────────
const paginate = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/workshops  — public, paginated, optional ?district=
// ─────────────────────────────────────────────────────────────────────────────
const getWorkshops = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.district) filter.district = req.query.district.trim();

    const [data, total] = await Promise.all([
      Workshop.find(filter).skip(skip).limit(limit).sort({ averageRating: -1 }),
      Workshop.countDocuments(filter),
    ]);
    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/workshops/nearby  — public, ?lat=&lng=&maxKm=
// $near requires the 2dsphere index on workshops.location
// ─────────────────────────────────────────────────────────────────────────────
const getNearbyWorkshops = async (req, res, next) => {
  try {
    const lat   = parseFloat(req.query.lat);
    const lng   = parseFloat(req.query.lng);
    const maxKm = parseFloat(req.query.maxKm) || 50;

    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError('lat and lng query params are required', 400);
    }

    const workshops = await Workshop.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: maxKm * 1000,
          spherical: true,
        },
      },
      {
        $addFields: {
          // Convert meters to kilometers and round to 1 decimal place
          distance: { $divide: [{ $round: [{ $multiply: ['$distance', 0.01] }, 0] }, 10] },
        },
      },
      { $limit: 20 },
    ]);

    res.json({ data: workshops });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/workshops/:id  — public
// ─────────────────────────────────────────────────────────────────────────────
const getWorkshopById = async (req, res, next) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) throw new AppError('Workshop not found', 404);
    res.json({ workshop });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/workshops  — admin only
// ─────────────────────────────────────────────────────────────────────────────
const createWorkshop = async (req, res, next) => {
  try {
    const { name, location, address, district, servicesOffered, contactNumber, description } = req.body;
    const workshop = await Workshop.create({
      name,
      location: { type: 'Point', coordinates: location.coordinates },
      address,
      district,
      servicesOffered: servicesOffered || [],
      contactNumber,
      ...(description && { description }),
    });
    res.status(201).json({ workshop });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/workshops/:id  — admin only
// ─────────────────────────────────────────────────────────────────────────────
const updateWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) throw new AppError('Workshop not found', 404);

    const allowed = ['name', 'address', 'district', 'contactNumber', 'servicesOffered', 'location', 'description'];
    allowed.forEach((key) => { if (req.body[key] !== undefined) workshop[key] = req.body[key]; });

    await workshop.save();
    res.json({ workshop });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/workshops/:id  — admin only (hard delete)
// ─────────────────────────────────────────────────────────────────────────────
const deleteWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) throw new AppError('Workshop not found', 404);
    res.json({ message: 'Workshop deleted' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/workshops/:id/image  — admin only, Multer + R2
// ─────────────────────────────────────────────────────────────────────────────
const uploadWorkshopImage = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No image file provided', 400);

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) throw new AppError('Workshop not found', 404);

    const key = `workshops/${workshop._id}/${Date.now()}-${req.file.originalname}`;
    await r2Client.send(new PutObjectCommand({
      Bucket:      R2_BUCKET,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    workshop.imageUrl = `${R2_PUBLIC_URL}/${key}`;
    await workshop.save();
    res.json({ imageUrl: workshop.imageUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWorkshops, getNearbyWorkshops, getWorkshopById,
  createWorkshop, updateWorkshop, deleteWorkshop,
  uploadWorkshopImage, upload,
};
