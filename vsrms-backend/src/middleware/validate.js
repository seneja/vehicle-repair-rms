'use strict';

const { body, param, query, validationResult } = require('express-validator');

/**
 * Reusable validation-result checker.
 * Place this as the LAST item in every validation chain array.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// ── Vehicle validations ──────────────────────────────────────────────────────
const validateCreateVehicle = [
  body('registrationNo').trim().notEmpty().withMessage('Registration number required'),
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1990 and ${new Date().getFullYear() + 1}`),
  body('vehicleType')
    .isIn(['car', 'motorcycle', 'tuk', 'van'])
    .withMessage('Vehicle type must be car, motorcycle, tuk, or van'),
  handleValidationErrors,
];

const validateUpdateVehicle = [
  body('make').optional().trim().notEmpty().withMessage('Make cannot be empty'),
  body('model').optional().trim().notEmpty().withMessage('Model cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1990 and ${new Date().getFullYear() + 1}`),
  body('vehicleType')
    .optional()
    .isIn(['car', 'motorcycle', 'tuk', 'van'])
    .withMessage('Vehicle type must be car, motorcycle, tuk, or van'),
  handleValidationErrors,
];

// ── Workshop validations ─────────────────────────────────────────────────────
const validateCreateWorkshop = [
  body('name').trim().notEmpty().withMessage('Workshop name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be [longitude, latitude]'),
  handleValidationErrors,
];

const validateUpdateWorkshop = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  body('contactNumber').optional().trim().notEmpty().withMessage('Contact number cannot be empty'),
  handleValidationErrors,
];

// ── Appointment validations ──────────────────────────────────────────────────
const validateCreateAppointment = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('workshopId').notEmpty().withMessage('Workshop ID is required'),
  body('serviceType').trim().notEmpty().withMessage('Service type is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  handleValidationErrors,
];

const validateUpdateAppointment = [
  body('serviceType').optional().trim().notEmpty().withMessage('Service type cannot be empty'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  handleValidationErrors,
];

const validateUpdateStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  handleValidationErrors,
];

// ── Service Record validations ───────────────────────────────────────────────
const validateCreateRecord = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('serviceDate').isISO8601().withMessage('Service date must be a valid ISO date'),
  body('workDone').trim().notEmpty().withMessage('Work done description is required'),
  body('totalCost').isFloat({ min: 0 }).withMessage('Total cost must be >= 0'),
  handleValidationErrors,
];

const validateUpdateRecord = [
  body('serviceDate').optional().isISO8601().withMessage('Service date must be a valid ISO date'),
  body('workDone').optional().trim().notEmpty().withMessage('Work done cannot be empty'),
  body('totalCost').optional().isFloat({ min: 0 }).withMessage('Total cost must be >= 0'),
  handleValidationErrors,
];

// ── Review validations ───────────────────────────────────────────────────────
const validateCreateReview = [
  body('workshopId').notEmpty().withMessage('Workshop ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('reviewText').optional().trim(),
  handleValidationErrors,
];

const validateUpdateReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('reviewText').optional().trim(),
  handleValidationErrors,
];

// ── Auth validations ─────────────────────────────────────────────────────────
const validateUpdateProfile = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim(),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateCreateVehicle,
  validateUpdateVehicle,
  validateCreateWorkshop,
  validateUpdateWorkshop,
  validateCreateAppointment,
  validateUpdateAppointment,
  validateUpdateStatus,
  validateCreateRecord,
  validateUpdateRecord,
  validateCreateReview,
  validateUpdateReview,
  validateUpdateProfile,
};
