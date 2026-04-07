# VSRMS Backend

Node.js + Express REST API for the Vehicle Service & Repair Management System.

## Tech Stack
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js v5
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** Asgardeo OIDC — JWT validated via JWKS (no session store)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Deployment:** Render.com (free tier)

---

## Local Setup

> **Note:** If you are running MongoDB locally, make sure the `mongod` service is running. See [../docs/setup.md](../docs/setup.md) for OS-specific instructions.

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
# Fill in all values in .env — see comments in .env.example
```

### 3. Start dev server
```bash
npm run dev     # nodemon — auto-restarts on file changes
```

### 4. Start for production
```bash
npm start       # node server.js
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ASGARDEO_ORG_NAME` | Asgardeo organisation name |
| `ASGARDEO_CLIENT_ID` | Asgardeo application client ID |
| `ASGARDEO_CLIENT_SECRET` | Asgardeo client secret (server-side only, never expose) |
| `ASGARDEO_ISSUER` | Asgardeo token issuer URL |
| `ASGARDEO_JWKS_URL` | JWKS endpoint for JWT verification |
| `ASGARDEO_AUDIENCE` | Optional client ID for audience validation |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms (default `900000` = 15 min) |
| `RATE_LIMIT_MAX` | Max requests per window (default `100`) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public base URL for R2 objects |

> ⚠️ Never commit `.env` to Git. It is already in `.gitignore`.

---

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | Public | ROPC token exchange with Asgardeo |
| POST | `/register` | Public | Create user via Asgardeo SCIM2 |
| POST | `/sync-profile` | JWT | Upsert MongoDB User after OIDC login |
| GET | `/me` | JWT | Get own profile |
| PUT | `/me` | JWT | Update phone / fullName |
| GET | `/users` | Admin | List all users (paginated) |
| DELETE | `/users/:id` | Admin | Soft-deactivate a user |

### Vehicles (`/api/v1/vehicles`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | List own vehicles (paginated, soft-deleted excluded) |
| POST | `/` | JWT | Create vehicle |
| GET | `/:id` | JWT | Get vehicle (ownership enforced) |
| PUT | `/:id` | JWT | Update vehicle (ownership enforced) |
| DELETE | `/:id` | JWT | Soft-delete vehicle |
| POST | `/:id/image` | JWT | Upload vehicle photo to R2 |

### Workshops (`/api/v1/workshops`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List workshops (paginated, `?district=`) |
| GET | `/nearby` | Public | `?lat=&lng=&maxKm=` — geospatial $near query |
| GET | `/:id` | Public | Get workshop |
| POST | `/` | Admin | Create workshop |
| PUT | `/:id` | Admin | Update workshop |
| DELETE | `/:id` | Admin | Delete workshop |
| POST | `/:id/image` | Admin | Upload workshop photo |

### Appointments (`/api/v1/appointments`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/mine` | JWT | List own appointments |
| POST | `/` | JWT | Book appointment (double-booking check) |
| GET | `/:id` | JWT | Get appointment |
| PUT | `/:id` | JWT | Edit (pending only) |
| PUT | `/:id/status` | Staff/Admin | Advance status (forward-only) |
| DELETE | `/:id` | JWT | Cancel (pending only) |

### Service Records (`/api/v1/records`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/vehicle/:vehicleId` | JWT | Get records for a vehicle (ownership enforced) |
| GET | `/:id` | JWT | Get record |
| POST | `/` | Staff | Create record |
| PUT | `/:id` | Staff | Update record |
| DELETE | `/:id` | Admin | Delete record |

### Reviews (`/api/v1/reviews`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/workshop/:workshopId` | Public | Workshop reviews (paginated) |
| GET | `/mine` | JWT | Own reviews |
| GET | `/:id` | JWT | Get review |
| POST | `/` | JWT | Create review (recalculates averageRating) |
| PUT | `/:id` | JWT | Update (ownership enforced, recalculates) |
| DELETE | `/:id` | JWT | Delete (ownership enforced, recalculates) |

---

## Pagination

All list endpoints support `?page=1&limit=20`. Response format:
```json
{ "data": [], "page": 1, "limit": 20, "total": 0, "pages": 0 }
```
Max limit is 100.

---

## Deployment to Render

1. Push code to GitHub.
2. Create a new **Web Service** on Render, link the repo.
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Add all environment variables from `.env.example` in the Render Dashboard (Environment tab).
6. Render will auto-deploy on every push to `main`.

> The free tier spins down after 15 minutes of inactivity. First request after idle takes ~30 seconds (cold start). This is acceptable for demo purposes.

---

## Health Check

```
GET /health  →  { "status": "ok", "service": "VSRMS API" }
```

Render uses this endpoint for health checks.
