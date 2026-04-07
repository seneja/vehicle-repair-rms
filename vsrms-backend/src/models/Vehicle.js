'use strict';

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    ownerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registrationNo: { type: String, required: true, uppercase: true, trim: true },
    make:           { type: String, required: true, trim: true },
    model:          { type: String, required: true, trim: true },
    year:           { type: Number, required: true, min: 1990, max: new Date().getFullYear() + 1 },
    vehicleType:    { type: String, enum: ['car', 'motorcycle', 'tuk', 'van'], required: true },
    imageUrl:       { type: String },
    mileage:        { type: Number, min: 0 },
    deletedAt:      { type: Date, default: null },
  },
  { timestamps: true },
);

vehicleSchema.index({ ownerId: 1 });
vehicleSchema.index({ registrationNo: 1 }, { unique: true });
vehicleSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
