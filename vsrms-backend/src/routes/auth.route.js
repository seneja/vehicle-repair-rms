'use strict';

const express  = require('express');
const router   = express.Router();

const { protect }       = require('../middleware/auth.middleware');
const { requireRole }   = require('../middleware/roles');
const { authLimiter }   = require('../middleware/rateLimiter');
const { validateUpdateProfile } = require('../middleware/validate');

const {
  login,
  register,
  syncProfile,
  getMe,
  updateMe,
  listUsers,
  deactivateUser,
  registerStaff,
  getWorkshopStaff,
} = require('../controllers/auth.controller');

// Public — rate-limited to prevent brute force
router.post('/login',    authLimiter, login);
router.post('/register', authLimiter, register);

// Upsert user record post-OIDC login (must be called once after getting token)
router.post('/sync-profile', protect, syncProfile);

// Own profile
router.get('/me',  protect, getMe);
router.put('/me',  protect, validateUpdateProfile, updateMe);

// Admin only
router.get('/users',        protect, requireRole('admin'), listUsers);
router.delete('/users/:id', protect, requireRole('admin'), deactivateUser);

// Workshop owner: manage their staff/technicians
router.get('/staff',  protect, requireRole('workshop_owner'), getWorkshopStaff);
router.post('/staff', protect, requireRole('workshop_owner'), registerStaff);

module.exports = router;
