'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    asgardeoSub: { type: String, required: true },
    fullName:    { type: String, required: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    phone:       { type: String, trim: true },
    role:        { type: String, enum: ['owner', 'staff', 'admin'], default: 'owner' },
    active:      { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ asgardeoSub: 1 }, { unique: true });
userSchema.index({ email: 1 },       { unique: true });

module.exports = mongoose.model('User', userSchema);
