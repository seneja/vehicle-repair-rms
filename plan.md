# plan.md — VSRMS Implementation Plan

> Living document. Update status as work progresses.
> Current date: 2026-04-11

---

## Current State Assessment

### Backend — LARGELY COMPLETE ✓
All 6 controllers and routes are implemented. Core middleware is in place.

| File | Status | Notes |
|------|--------|-------|
| server.js | ✓ Done | Middleware order correct |
| config/db.js, r2.js | ✓ Done | |
| middleware/auth.middleware.js | ✓ Done | JWKS client, user lookup, req.user attachment |
| middleware/errorHandler.js | ✓ Done | AppError, globalErrorHandler, error conversions |
| middleware/rateLimiter.js | ✓ Done | apiLimiter + authLimiter |
| middleware/roles.js, validate.js | ✓ Done | |
| models/User.js | ✓ Done | |
| models/Vehicle.js | ✓ Done | Soft delete, indexes |
| models/Workshop.js | ✓ Done | Added `description` field |
| models/Appointment.js | ✓ Done | isValidTransition static method |
| models/ServiceRecord.js | ✓ Done | |
| models/Review.js | ✓ Done | |
| controllers/auth.controller.js | ✓ Done | ROPC proxy, SCIM2 register, sync-profile with upsert |
| controllers/vehicle.controller.js | ✓ Done | Full CRUD + image upload + soft delete |
| controllers/workshop.controller.js | ✓ Done | Full CRUD + nearby ($geoNear) + image upload |
| controllers/appointment.controller.js | ✓ Done | Fixed status filter extraction bug (B1); supports comma-separated status values |
| controllers/record.controller.js | ✓ Done | Ownership enforcement |
| controllers/review.controller.js | ✓ Done | recalculateRating called correctly |
| utils/reviewHelper.js, geoHelper.js | ✓ Done | |
| routes/*.route.js | ✓ Done | Specific routes registered before :id |

### Mobile — NEARLY COMPLETE ✓
Feature-slice architecture, providers, and all layouts are finalized.
Dashboards standardized to premium Dark Header/White Card theme.

| Area | Status | Notes |
|------|--------|-------|
| services/http.client.ts | ✓ Done | Single Axios instance |
| services/storage.service.ts | ✓ Done | |
| services/location.service.ts | ✓ Done | |
| providers/AuthProvider.tsx | ✓ Done | Real flow wired; bypass for dev only |
| providers/QueryProvider.tsx | ✓ Done | |
| theme/ | ✓ Done | Unistyles tokens fixed (screenPadding: 24) |
| app/_layout.tsx | ✓ Done | Role-based routing |
| features/auth/screens/LoginScreen.tsx | ✓ Done | Fixed handleSignIn flow (B2) |
| features/auth/screens/RegisterScreen.tsx | ✓ Done | Standardized to premium UI |
| features/vehicles/screens/* | ✓ Done | List, Add, Edit, Detail |
| features/workshops/screens/WorkshopDetailScreen | ✓ Done | Fixed specialization/description (B4, B5) |
| features/workshops/screens/WorkshopListScreen | ✓ Done | |
| features/workshops/screens/NearbyWorkshopsScreen | ✓ Done | |
| features/appointments/screens/AppointmentListScreen | ✓ Done | Upcoming/Past tabs pass comma-separated status to backend (B3) |
| features/records/screens/* | ✓ Done | List, Detail, Add |
| features/reviews/screens/ReviewListScreen | ✓ Done | |
| app/customer/schedule/ | ✓ Done | Book screen route implementation |
| app/customer/workshops/ | ✓ Done | Book from workshop detail implementation |
| app/technician/* | ✓ Done | Premium Dashboard + Appointments |
| app/owner/* | ✓ Done | Premium Dashboard + Jobs |
| app/admin/* | ✓ Done | Premium Dashboard + Garages (FIXED B8) |

---

### Priority 3 — UI/UX Enterprise Polish

#### Design System Consistency
All screens must:
- Use `ScreenWrapper` as the outermost container
- Show `Skeleton` during loading (not blank screens or ActivityIndicator)
- Show `ErrorScreen` with retry on error
- Show `EmptyState` with an icon on empty lists

#### Typography & Spacing
Use theme tokens consistently:
- `theme.colors.brand` (#F56E0F) for primary actions and accents
- `theme.colors.text` (#1A1A2E) for headings
- `theme.colors.muted` (#6B7280) for body/metadata
- `theme.spacing.md` (16) as default padding
- `theme.radii.lg` (12) for card borders

#### Appointment Status Badges
Colour-code status badges:
- `pending` → amber/warning
- `confirmed` → blue/info
- `in_progress` → brand orange
- `completed` → green/success
- `cancelled` → red/error

#### Pull-to-Refresh
All FlashList components must have `onRefresh={refetch}` and `refreshing={isLoading}`.

#### Form Validation UX
- Validate on blur and on submit
- Show inline red error text below each input
- Disable submit button while loading
- Show success toast (via ToastProvider) on successful mutations

#### Image handling
- VehicleCard and WorkshopCard: show placeholder icon if `imageUrl` is null
- Vehicle detail: show upload button if no image; replace image if exists
- Use `expo-image-picker` → `upload.service.ts` → POST /:id/image

---

### Priority 4 — Security Audit

Run through every item in the security checklist in TASK.md:

1. **express-validator chains**: Verify every POST and PUT route has a `[...validationRules, validate, controller]` chain.
2. **JWKS caching**: `auth.middleware.js` — confirm `cache: true` and check `cacheMaxAge`.
3. **CORS origins**: Production deploy must set `ALLOWED_ORIGINS` to the Expo production URL.
4. **No secrets in source**: Grep for any hardcoded keys or passwords in .js/.ts files.
5. **Role guards**: Test that `/auth/users` returns 403 for non-admin, `/records` returns 403 for customers on other users' vehicles.

---

### Priority 5 — Deployment & Final Demo

1. Push backend to Render.com — verify GET /health returns `{ status: "ok" }`.
2. Set all env vars in Render dashboard (never commit .env).
3. Set `EXPO_PUBLIC_API_URL` in `vsrms-mobile/.env` to the Render URL.
4. Build Expo app for physical device: `npx expo start --no-dev --minify`.
5. Test entire happy-path flow on a physical Android/iOS device.
6. Verify image upload works (Cloudflare R2 accessible from device).

---

## Architecture Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| ROPC grant (not PKCE) on mobile | Asgardeo PKCE requires a browser redirect which breaks the native feel; ROPC is proxied through backend so the client_secret stays server-side | Pre-existing |
| Soft delete for vehicles only | Vehicles have appointment/record history — hard delete would orphan foreign keys | Per spec |
| averageRating denormalised on Workshop | avoids aggregation on every GET /workshops call which would be expensive on M0 | Per spec |
| FlashList instead of FlatList | Significantly better performance for long lists (recycled cells) | Pre-existing |
| mockSignIn in AuthProvider | Developer shortcut to quickly test role-based UI without Asgardeo credentials | Pre-existing — remove before final demo submission or guard behind `__DEV__` |
| Multer inline in controllers | Simpler than shared middleware for this scale; both M2 and M3 duplicate the upload logic | Pre-existing — acceptable for academic scale |

---

## Future Roadmap (post-submission, personal project continuation)

These are ideas for after the SE2020 submission deadline.
Do NOT implement these before demo — they are out of scope.

- Push notifications for appointment status changes (Expo Notifications + FCM)
- Real-time job tracking with WebSockets
- Multi-workshop support for owners (currently assumes 1 owner = 1 workshop)
- Parts inventory management module
- Invoice/PDF generation for service records
- Customer loyalty points system
- Workshop analytics dashboard (revenue, popular services, peak hours)
- Dark mode support (add dark theme to unistyles config)
- OTP-based password recovery
- Social login (Google/Apple) via Asgardeo federation
- Offline support with React Query persisted cache
