'use strict';

const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/auth.controller');

// Rate-limiting middleware (applied inline via express-rate-limit or handled at server level)
// Routes are intentionally public — auth happens via Asgardeo
router.post('/login', login);
router.post('/register', register);

module.exports = router;
