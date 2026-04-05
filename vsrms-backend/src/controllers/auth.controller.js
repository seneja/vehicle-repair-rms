'use strict';

const axios = require('axios');

const ASGARDEO_BASE = `https://api.asgardeo.io/t/${process.env.ASGARDEO_ORG_NAME}`;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// Proxies Resource Owner Password Credentials (ROPC) grant to Asgardeo.
// Keeps client_secret on the server — the mobile app sends only email+password.
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', email);
    params.append('password', password);
    params.append('scope', 'openid profile email phone');
    params.append('client_id', process.env.ASGARDEO_CLIENT_ID);
    params.append('client_secret', process.env.ASGARDEO_CLIENT_SECRET);

    const tokenRes = await axios.post(
      `${ASGARDEO_BASE}/oauth2/token`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const { access_token, id_token, refresh_token, expires_in } = tokenRes.data;

    if (!access_token) {
      return res.status(401).json({ success: false, message: 'Authentication failed: no token returned.' });
    }

    // Fetch user profile from Asgardeo using the access token
    let userInfo = { email };
    try {
      const userRes = await axios.get(`${ASGARDEO_BASE}/oauth2/userinfo`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      userInfo = userRes.data;
    } catch (err) {
      console.warn('[auth] Could not fetch userinfo from Asgardeo:', err?.response?.data ?? err.message);
    }

    return res.status(200).json({
      success: true,
      access_token,
      id_token,
      refresh_token,
      expires_in,
      user: userInfo,
    });
  } catch (err) {
    const asgardeoError = err?.response?.data;
    console.error('[auth/login] Asgardeo error:', asgardeoError ?? err.message);

    // Map Asgardeo error codes to friendly messages
    let message = 'Authentication failed.';
    if (asgardeoError?.error === 'invalid_grant') {
      message = 'Incorrect email or password.';
    } else if (asgardeoError?.error === 'invalid_client') {
      message = 'Server configuration error. Please contact support.';
    }

    return res.status(401).json({ success: false, message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// Creates a user in Asgardeo via SCIM2. The client_secret never leaves the server.
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'firstName, lastName, email, and password are required.' });
  }

  try {
    // 1. Obtain a client-credentials token scoped for SCIM2 management
    const ccParams = new URLSearchParams();
    ccParams.append('grant_type', 'client_credentials');
    ccParams.append('scope', 'internal_user_mgt_create');
    ccParams.append('client_id', process.env.ASGARDEO_CLIENT_ID);
    ccParams.append('client_secret', process.env.ASGARDEO_CLIENT_SECRET);

    const ccRes = await axios.post(
      `${ASGARDEO_BASE}/oauth2/token`,
      ccParams.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const mgmtToken = ccRes.data.access_token;

    // 2. Build SCIM2 user payload
    const scimUser = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: email,
      password,
      name: {
        givenName: firstName,
        familyName: lastName,
      },
      emails: [{ primary: true, value: email }],
      ...(phone && {
        phoneNumbers: [{ type: 'mobile', value: phone }],
      }),
      // Custom enterprise attribute — role stored as a profile attribute
      'urn:scim:wso2:schema': {
        appRole: role ?? 'Vehicle Owner',
      },
    };

    // 3. Create the user
    await axios.post(
      `${ASGARDEO_BASE}/scim2/Users`,
      scimUser,
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          'Content-Type': 'application/scim+json',
        },
      },
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now sign in.',
    });
  } catch (err) {
    const asgardeoError = err?.response?.data;
    console.error('[auth/register] Asgardeo error:', asgardeoError ?? err.message);

    let message = 'Registration failed.';
    const detail = asgardeoError?.detail ?? asgardeoError?.message ?? '';

    if (detail.toLowerCase().includes('already exists') || err?.response?.status === 409) {
      message = 'An account with this email already exists.';
    } else if (err?.response?.status === 400) {
      message = `Invalid registration data: ${detail}`;
    } else if (err?.response?.status === 403) {
      message = 'Self-registration is not enabled. Please contact an administrator.';
    }

    return res.status(err?.response?.status ?? 500).json({ success: false, message });
  }
};

module.exports = { login, register };
