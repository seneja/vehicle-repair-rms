'use strict';

const express = require('express');
const router  = express.Router();

const { protect }     = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles');
const {
  validateCreateRecord,
  validateUpdateRecord,
} = require('../middleware/validate');

const {
  getRecordsByVehicle,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getWorkshopRecords,
} = require('../controllers/record.controller');

// All record routes require authentication
router.use(protect);

// CRITICAL: specific routes MUST be registered before /:id
router.get('/vehicle/:vehicleId',   getRecordsByVehicle);
router.get('/workshop/:workshopId', requireRole('workshop_owner', 'workshop_staff', 'admin'), getWorkshopRecords);
router.post('/',     requireRole('workshop_staff', 'workshop_owner', 'admin'), validateCreateRecord, createRecord);
router.get('/:id',   getRecord);
router.put('/:id',   requireRole('workshop_staff', 'workshop_owner', 'admin'), validateUpdateRecord, updateRecord);
router.delete('/:id', requireRole('admin'), deleteRecord);

module.exports = router;
