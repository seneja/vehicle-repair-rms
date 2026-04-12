'use strict';

const axios   = require('axios');
const User    = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const ASGARDEO_BASE = `https://api.asgardeo.io/t/${process.env.ASGARDEO_ORG_NAME}`;

// ── Pagination helper ─────────────────────────────────────────────────────────
const paginate = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// Proxies ROPC grant to Asgardeo — public client (no client_secret).
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username',   email);
    params.append('password',   password);
    params.append('scope',      'openid profile email phone');
    params.append('client_id',  process.env.ASGARDEO_CLIENT_ID);

    const tokenRes = await axios.post(
      `${ASGARDEO_BASE}/oauth2/token`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const { access_token, id_token, refresh_token, expires_in } = tokenRes.data;
    if (!access_token) {
      return res.status(401).json({ error: 'Authentication failed: no token returned' });
    }

    // Fetch user profile from Asgardeo
    let userInfo = { email };
    try {
      const userRes = await axios.get(`${ASGARDEO_BASE}/oauth2/userinfo`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      userInfo = userRes.data;
    } catch (err) {
      console.warn('[auth/login] Could not fetch userinfo:', err?.response?.data ?? err.message);
    }

    return res.status(200).json({ access_token, id_token, refresh_token, expires_in, user: userInfo });
  } catch (err) {
    const asgardeoErr = err?.response?.data;
    console.error('[auth/login] Asgardeo error:', asgardeoErr ?? err.message);
    let message = 'Authentication failed';
    if (asgardeoErr?.error === 'invalid_grant')  message = 'Incorrect email or password';
    if (asgardeoErr?.error === 'invalid_client') message = 'Server configuration error';
    return res.status(401).json({ error: message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// Creates user in Asgardeo via SCIM2.
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'firstName, lastName, email, and password are required' });
    }

    const roleMapping = {
      'Vehicle Owner':  'customer',
      'Garage Owner':   'workshop_owner',
    };
    const internalRole = roleMapping[role] || 'customer';

    // Self-registration via SCIM2 — no management token required.
    // Requires "Self Registration" to be enabled in the Asgardeo console:
    //   Console → User Management → Self Registration → Enable
    const scimUser = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: email,
      password,
      name: { givenName: firstName, familyName: lastName },
      emails: [{ primary: true, value: email }],
      ...(phone && { phoneNumbers: [{ type: 'mobile', value: phone }] }),
    };

    const scimRes = await axios.post(`${ASGARDEO_BASE}/scim2/Users`, scimUser, {
      headers: { 'Content-Type': 'application/scim+json' },
    });

    // Pre-create MongoDB document so role and profile are ready before first login.
    const asgardeoSub = scimRes.data?.id ?? email;
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $setOnInsert: {
          asgardeoSub,
          email:    email.toLowerCase(),
          fullName: `${firstName} ${lastName}`.trim(),
          role:     internalRole,
          active:   true,
          ...(phone && { phone }),
        },
      },
      { upsert: true, new: true },
    );

    return res.status(201).json({ message: 'Account created successfully — you can now sign in' });
  } catch (err) {
    const asgardeoErr = err?.response?.data;
    console.error('[auth/register] Asgardeo error:', asgardeoErr ?? err.message);
    let message = 'Registration failed';
    const detail = asgardeoErr?.detail ?? asgardeoErr?.message ?? '';
    if (detail.toLowerCase().includes('already exists') || err?.response?.status === 409) {
      message = 'An account with this email already exists';
    } else if (err?.response?.status === 400) {
      message = `Invalid registration data: ${detail}`;
    } else if (err?.response?.status === 403) {
      message = 'Self-registration is disabled — enable it in the Asgardeo console under User Management → Self Registration';
    }
    return res.status(err?.response?.status ?? 500).json({ error: message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/sync-profile   (JWT required)
// Upserts the MongoDB User document using the Asgardeo sub from the JWT.
// Call this once after every successful OIDC login before hitting other APIs.
// ─────────────────────────────────────────────────────────────────────────────
const syncProfile = async (req, res, next) => {
  try {
    const decoded = req.jwtClaims; // set by protect middleware
    const email   = (decoded.email ?? '').toLowerCase();

    // Match by asgardeoSub first, then fall back to email.
    // The email fallback links pre-created records (e.g. staff registered by owner)
    // to the Asgardeo account on first login.
    const user = await User.findOneAndUpdate(
      { $or: [{ asgardeoSub: decoded.sub }, ...(email ? [{ email }] : [])] },
      {
        $set: {
          asgardeoSub: decoded.sub,
          email,
          fullName: decoded.name ?? decoded.email ?? 'Unknown',
        },
        $setOnInsert: {
          role:   'customer',
          active: true,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/auth/me  — update fullName and/or phone
// ─────────────────────────────────────────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (phone    !== undefined) updates.phone    = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/users  — admin only, paginated
// ─────────────────────────────────────────────────────────────────────────────
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const [data, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);
    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/auth/users/:id  — admin only, soft deactivate
// ─────────────────────────────────────────────────────────────────────────────
const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      throw new AppError('You cannot deactivate your own account', 400);
    }
    const user = await User.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!user) throw new AppError('User not found', 404);
    res.json({ message: 'User deactivated', user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/staff  — workshop_owner only; registers a technician
// Creates Asgardeo account + MongoDB user linked to caller's workshopId
// ─────────────────────────────────────────────────────────────────────────────
const registerStaff = async (req, res, next) => {
  try {
    const owner = req.user;
    if (!owner.workshopId) {
      throw new AppError('Your account is not linked to a workshop', 400);
    }

    const { firstName, lastName, email, phone } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName, and email are required' });
    }

    // Create (or update) the MongoDB record so role + workshopId are ready.
    // No Asgardeo account is created here — the technician must register via
    // the app's normal register screen. On their first login, sync-profile
    // matches by email and links their Asgardeo account to this record.
    const staffUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          role:       'workshop_staff',
          workshopId: owner.workshopId,
          fullName:   `${firstName} ${lastName}`.trim(),
          active:     true,
          ...(phone && { phone }),
        },
        $setOnInsert: {
          email:       email.toLowerCase(),
          asgardeoSub: `pending-${Date.now()}`, // placeholder until first login
        },
      },
      { upsert: true, new: true },
    );

    return res.status(201).json({
      message: 'Technician profile created. Ask them to register with this email in the app to activate their account.',
      user: staffUser,
    });
  } catch (err) {
    console.error('[auth/staff] error:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/staff  — workshop_owner: list their own staff
// ─────────────────────────────────────────────────────────────────────────────
const getWorkshopStaff = async (req, res, next) => {
  try {
    const owner = req.user;
    if (!owner.workshopId) {
      return res.json({ data: [], total: 0 });
    }
    const { page, limit, skip } = paginate(req.query);
    const filter = { role: 'workshop_staff', workshopId: owner.workshopId };
    const [data, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, syncProfile, getMe, updateMe, listUsers, deactivateUser, registerStaff, getWorkshopStaff };
