'use strict';

const mongoose = require('mongoose');
const jsonFormatter = require('./plugins/jsonFormatter');

const userSchema = new mongoose.Schema(
  {
    asgardeoSub: { type: String, required: true },
    fullName:    { type: String, required: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    phone:       { type: String, trim: true },
    role:        {
      type:    String,
      enum:    ['customer', 'workshop_owner', 'workshop_staff', 'admin'],
      default: 'customer',
    },
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' }, // For owners/staff
    active:     { type: Boolean, default: true },
    // Only used for mock/development accounts when Asgardeo is bypassed
    password:   { type: String, select: false },
  },
  { timestamps: true },
);

userSchema.plugin(jsonFormatter);

userSchema.index({ asgardeoSub: 1 }, { unique: true });
userSchema.index({ email: 1 },       { unique: true });

// ── Password Hashing (Mock accounts only) ──
const crypto = require('crypto');

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = crypto.createHash('sha256').update(this.password).digest('hex');
});

userSchema.methods.comparePassword = function (plaintext) {
  if (!this.password) return false;
  const hashed = crypto.createHash('sha256').update(plaintext).digest('hex');
  return this.password === hashed;
};

module.exports = mongoose.model('User', userSchema);
