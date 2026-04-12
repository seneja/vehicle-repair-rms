# TASK.md — VSRMS Sprint Board

> SE2020 Group Assignment | 28 Mar – 18 Apr 2026 | 6 Members  
> Mark tasks: `[ ]` = todo · `[~]` = in progress · `[x]` = done · `[!]` = blocked

---

## Known Issues Log

| Date | Module | Issue | Status | Fixed By |
|------|--------|-------|--------|----------|
| 2026-04-11 | M4 Appointments | `paginate()` destructures `status` but function never returns it → status filter always undefined | **FIXED** | Claude |
| 2026-04-11 | M1 Auth | LoginScreen real sign-in calls setTimeout + fake error → **FIXED**: now calls `authApi.login()` then `signIn(token)` | **FIXED** | Claude |
| 2026-04-11 | M4 Appointments | Upcoming/Past tab filter is client-side; should pass `?status=` to backend | **FIXED** | Claude |
| 2026-04-11 | M3 Workshops | WorkshopDetailScreen uses `workshop.specialization` → **FIXED**: now uses `workshop.servicesOffered` | **FIXED** | Claude |
| 2026-04-11 | M3 Workshops | WorkshopDetailScreen uses `workshop.description` — field missing from Workshop schema | **FIXED** | Claude |
| 2026-04-11 | M4 Appointments | `/customer/schedule/book` route does not exist | **FIXED** | Claude |
| 2026-04-11 | M3 Workshops | `/customer/workshops/book/${id}` route does not exist | **FIXED** | Claude |
| 2026-04-11 | M2 Vehicles | VehicleDetailScreen used mock hardcoded service history | **FIXED** | Claude |
| 2026-04-11 | M5 Records | RecordCard used `record.description` and `record.cost` (wrong field names) | **FIXED** | Claude |
| 2026-04-11 | M5 Records | RecordListScreen imported non-existent `useRecords` hook | **FIXED** | Claude |
| 2026-04-11 | M6 Reviews | ReviewCard typed `userId` as string only but backend can populate it as object | **FIXED** | Claude |
| 2026-04-11 | M3 Workshops | WorkshopCard had hardcoded `"Colombo"` and `"1.2 km"` distance | **FIXED** | Claude |
| 2026-04-11 | M3 Admin | AdminOverviewScreen missing `StatusBar` import and `trend` property on stats | **FIXED** | Claude |
| 2026-04-11 | M4 Appointments | BookAppointmentScreen referenced removed DateTimePicker variables | **FIXED** | Claude |
| 2026-04-11 | M3 Admin | `AdminGaragesScreen` crashed: `useRegisterWorkshop` undefined | **FIXED** | Claude |
| 2026-04-11 | M5 Records | Technician/Owner record entry UI was non-standard | **FIXED** | Claude |
| 2026-04-11 | General | "Log" and "History" tabs show forms instead of lists | **OPEN** | — |
| 2026-04-12 | M4 Appointments | Backend status filter didn't support comma-separated values → Upcoming/Past grouping broken | **FIXED** | Claude |
| 2026-04-12 | M4 Appointments | AppointmentListScreen used individual status tabs instead of Upcoming/Past grouping | **FIXED** | Claude |
| 2026-04-12 | M3 Admin | WorkshopDetailScreen book button navigated to `/tabs/schedule/book` (wrong) → `/customer/schedule/book` | **FIXED** | Claude |
| 2026-04-12 | M3 Admin | AdminGaragesScreen workshop creation missing `location` field → backend 400 error | **FIXED** | Claude |
| 2026-04-12 | M1 Admin | AdminUsersScreen used `<div>` instead of `<View>` → React Native crash | **FIXED** | Claude |
| 2026-04-12 | M5 Records | AddRecordScreen sent `totalCost: undefined` when blank → backend 400 (required field) | **FIXED** | Claude |
| 2026-04-12 | M3 Workshops | updateWorkshop missing `description` in allowed fields list | **FIXED** | Claude |
| 2026-04-12 | M2 Vehicles | Customer vehicles tab label incorrectly set to "Garage" → now "Vehicles" | **FIXED** | Claude |
| 2026-04-11 | M2 Vehicles | Missing routes: `/customer/vehicles/add` and `/customer/vehicles/edit/[id]` | **FIXED** | Claude |
| 2026-04-11 | General | `ScreenWrapper` used `StyleSheet` from `react-native` (violates CLAUDE.md) | **FIXED** | Claude |
| 2026-04-11 | M6 Reviews | `useWorkshopReviews` missing `enabled: !!workshopId` guard | **FIXED** | Claude |
| 2026-04-11 | Landing | `src/app/index.tsx` imported from non-existent `'../constants/theme'` | **FIXED** | Claude |
| 2026-04-11 | General | AppLogo component was missing — auth screens showed a plain box icon | **FIXED** | Claude |

---

## Shared Infrastructure

### Backend shared setup
- [x] `server.js` — middleware order correct (helmet → cors → json → sanitize → limiter → routes → errorHandler)
- [x] `src/config/db.js` — Mongoose connection with retry logic
- [x] `src/config/r2.js` — Cloudflare R2 S3 client
- [x] `src/middleware/errorHandler.js` — AppError class + globalErrorHandler (converts Mongoose/JWT/dup-key errors)
- [x] `src/middleware/auth.middleware.js` — JWKS validation, MongoDB user lookup, req.user attachment
- [x] `src/middleware/rateLimiter.js` — apiLimiter (100/15min) + authLimiter (20/15min)
- [x] `src/middleware/roles.js` — requireRole(...roles) guard
- [x] `src/middleware/validate.js` — express-validator result checker
- [x] `vsrms-backend/.env.example` — all env vars documented

### Mobile shared setup
- [x] `src/services/http.client.ts` — single Axios instance, request/response interceptors
- [x] `src/services/storage.service.ts` — AsyncStorage wrapper
- [x] `src/services/location.service.ts` — expo-location wrapper with permission handling
- [x] `src/services/upload.service.ts` — multipart upload helper
- [x] `src/services/error.handler.ts` — error normalisation
- [x] `src/providers/AuthProvider.tsx` — token, user, role, signIn, signOut
- [x] `src/providers/QueryProvider.tsx` — React Query client
- [x] `src/providers/ToastProvider.tsx`
- [x] `src/types/api.types.ts` — PaginatedResponse<T> and ApiError
- [x] `src/theme/tokens.ts, typography.ts, breakpoints.ts, unistyles.ts`
- [x] `src/app/_layout.tsx` — role-based routing (customer→tabs, owner→garage, staff→staff, admin→admin)
- [x] `src/components/feedback/Skeleton.tsx` — shimmer pulse animation
- [x] `src/components/feedback/ErrorScreen.tsx` — branded retry UI
- [x] `src/components/feedback/ErrorBoundary.tsx`
- [x] `src/components/ui/Button.tsx, Input.tsx, Badge.tsx, EmptyState.tsx`
- [x] `src/components/ui/AppLogo.tsx` — SVG-path logo, used on landing, login, register
- [x] `src/components/layout/ScreenWrapper.tsx` — unistyles (fixed from react-native StyleSheet)
- [x] `src/app/index.tsx` — landing page (rewritten: unistyles, AppLogo, feature list, stats, no broken imports)

---

## Week 1 (28 Mar – 4 Apr) — Backend Models + Infrastructure

### Index Requirements (all schemas)
- [x] User: `.index({ asgardeoSub: 1 }, { unique: true })`
- [x] User: `.index({ email: 1 }, { unique: true })`
- [x] Vehicle: `.index({ ownerId: 1 })`
- [x] Vehicle: `.index({ registrationNo: 1 }, { unique: true })`
- [x] Vehicle: `.index({ deletedAt: 1 })`
- [x] Workshop: `workshopSchema.index({ location: '2dsphere' })`
- [x] Workshop: `.index({ district: 1 })`
- [x] Workshop: `.index({ averageRating: -1 })`
- [x] Appointment: `.index({ userId: 1 })`
- [x] Appointment: `.index({ workshopId: 1 })`
- [x] Appointment: `.index({ vehicleId: 1 })`
- [x] Appointment: `.index({ status: 1 })`
- [x] Appointment: `.index({ workshopId: 1, scheduledDate: 1 })` — double-booking compound
- [x] ServiceRecord: `.index({ vehicleId: 1 })`
- [x] ServiceRecord: `.index({ appointmentId: 1 })`
- [x] Review: `.index({ workshopId: 1 })`
- [x] Review: `.index({ userId: 1 })`
- [x] Review: `.index({ workshopId: 1, userId: 1 }, { unique: true })` — one review per user per workshop

### M1 — Auth & User (Backend)
- [x] `src/models/User.js` — asgardeoSub, email, fullName, phone, role, active
- [x] `src/routes/auth.route.js` — 7 routes with validation chains
- [x] `src/controllers/auth.controller.js` — login (ROPC proxy), register (SCIM2), syncProfile (upsert), getMe, updateMe, listUsers, deactivateUser

### M2 — Vehicle Management (Backend)
- [x] `src/models/Vehicle.js` — ownerId, registrationNo, make, model, year, vehicleType, mileage, imageUrl, deletedAt
- [x] `src/routes/vehicle.route.js` — 6 routes
- [x] `src/controllers/vehicle.controller.js` — getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle (soft), uploadVehicleImage

### M3 — Workshop Management (Backend)
- [x] `src/models/Workshop.js` — name, location (GeoJSON), address, district, servicesOffered, contactNumber, averageRating, imageUrl
- [x] `src/routes/workshop.route.js` — `/nearby` registered before `/:id`
- [x] `src/controllers/workshop.controller.js` — getWorkshops, getNearbyWorkshops ($geoNear aggregation), getWorkshopById, createWorkshop, updateWorkshop, deleteWorkshop, uploadWorkshopImage
- [x] **BUG FIX B5**: `description` field added to Workshop schema, createWorkshop, updateWorkshop

### M4 — Appointments (Backend)
- [x] `src/models/Appointment.js` — userId, vehicleId, workshopId, serviceType, scheduledDate, status (enum), notes; `isValidTransition` static method
- [x] `src/routes/appointment.route.js` — `/mine` registered before `/:id`
- [x] `src/controllers/appointment.controller.js` — getMyAppointments, getAppointment, createAppointment (double-booking, past-date), updateAppointment, updateAppointmentStatus (state machine), deleteAppointment
- [x] **BUG FIX B1**: `getMyAppointments` — `status` extracted from `req.query` directly (not from `paginate()`); supports comma-separated values

### M5 — Service Records (Backend)
- [x] `src/models/ServiceRecord.js` — vehicleId, appointmentId, serviceDate, workDone, partsReplaced, totalCost, mileageAtService, technicianName
- [x] `src/routes/record.route.js` — `/vehicle/:vehicleId` and `/workshop/:workshopId` registered before `/:id`
- [x] `src/controllers/record.controller.js` — getRecordsByVehicle, getRecord, getWorkshopRecords, createRecord, updateRecord, deleteRecord; ownership via `assertVehicleOwnership`

### M6 — Reviews (Backend)
- [x] `src/models/Review.js` — workshopId, userId, rating (1-5), reviewText, appointmentId
- [x] `src/routes/review.route.js` — `/workshop/:workshopId` and `/mine` registered before `/:id`
- [x] `src/controllers/review.controller.js` — getWorkshopReviews, getMyReviews, getReview, createReview (recalculate), updateReview (recalculate), deleteReview (recalculate)
- [x] `src/utils/reviewHelper.js` — `recalculateRating(workshopId)` aggregation pipeline
- [x] `src/utils/geoHelper.js`

---

## Week 2 (5 Apr – 11 Apr) — Mobile Feature Screens

### M1 — Auth & User (Mobile)
- [x] `features/auth/types/auth.types.ts` — User interface matching API shape
- [x] `features/auth/api/auth.api.ts` — login, register, syncProfile, getMe, updateMe
- [x] `features/auth/queries/auth.keys.ts, mutations.ts, queries.ts`
- [x] `features/auth/screens/LoginScreen.tsx` — real `handleSignIn` via `authApi.login()` + `signIn(token)`; AppLogo; theme tokens
- [x] `features/auth/screens/RegisterScreen.tsx` — AppLogo; theme tokens; all hardcoded hex replaced
- [x] `app/auth/login.tsx`, `app/auth/register.tsx` — route wrappers
- [x] `app/customer/index.tsx` — owner profile screen (show user.fullName, role badge, stats, sign-out)
- [x] `app/admin/users.tsx` — admin: paginated user list with role badges, search, deactivate action (calls DELETE /auth/users/:id)
- [x] `app/admin/index.tsx` — admin dashboard screen (fixed StatusBar + trend props)

### M2 — Vehicle Management (Mobile)
- [x] `features/vehicles/types/vehicles.types.ts`
- [x] `features/vehicles/api/vehicles.api.ts`
- [x] `features/vehicles/queries/vehicles.keys.ts, mutations.ts, queries.ts`
- [x] `features/vehicles/components/VehicleCard.tsx`
- [x] `features/vehicles/screens/VehicleListScreen.tsx` — FlashList, add button
- [x] `features/vehicles/screens/AddVehicleScreen.tsx` — vehicle type grid, per-field validation, professional design
- [x] `features/vehicles/screens/EditVehicleScreen.tsx` — locked reg number banner, professional design
- [x] `features/vehicles/screens/VehicleDetailScreen.tsx` — real service records via `useVehicleRecords(id)`, edit button
- [x] `app/customer/vehicles/index.tsx, [id].tsx, _layout.tsx`
- [x] `app/customer/vehicles/add.tsx` — route wrapper for AddVehicleScreen
- [x] `app/customer/vehicles/edit/[id].tsx` — route wrapper for EditVehicleScreen
- [x] Vehicle image upload UI — pick image with expo-image-picker, POST /vehicles/:id/image

### M3 — Workshop Management (Mobile)
- [x] `features/workshops/types/workshops.types.ts`
- [x] `features/workshops/api/workshops.api.ts`
- [x] `features/workshops/queries/workshops.keys.ts, mutations.ts, queries.ts`
- [x] `features/workshops/components/WorkshopCard.tsx` — real data only (no hardcoded district/distance)
- [x] `features/workshops/components/RatingStars.tsx, WorkshopMap.tsx`
- [x] `features/workshops/screens/WorkshopListScreen.tsx`
- [x] `features/workshops/screens/NearbyWorkshopsScreen.tsx`
- [x] `features/workshops/screens/WorkshopDetailScreen.tsx` — uses `servicesOffered`, shows up to 3 reviews via `useWorkshopReviews`
- [x] `app/customer/workshops/index.tsx, [id].tsx, _layout.tsx`
- [x] **BUG FIX B5**: `description` field in Workshop schema + createWorkshop/updateWorkshop; WorkshopDetailScreen shows it conditionally; admin garage form now has description + servicesOffered inputs
- [x] **BUG FIX B6**: WorkshopDetailScreen "Book Appointment" button routes to `/customer/schedule/book?workshopId=…`; `app/customer/schedule/book.tsx` accepts workshopId param and pre-selects the workshop
- [x] `app/admin/garages.tsx` — admin: create/edit/delete workshop form (FIXED crash); now includes description + servicesOffered fields

### M4 — Appointments (Mobile)
- [x] `features/appointments/types/appointments.types.ts`
- [x] `features/appointments/api/appointments.api.ts`
- [x] `features/appointments/queries/appointments.keys.ts, mutations.ts, queries.ts`
- [x] `features/appointments/components/AppointmentCard.tsx` — colour-coded status accent border
- [x] `features/appointments/screens/AppointmentListScreen.tsx` — tab UI (Upcoming/Past)
- [x] `features/appointments/screens/BookAppointmentScreen.tsx` — dark header style; TextInput date field
- [x] **BUG FIX B3**: AppointmentListScreen passes `?status=pending,confirmed,in_progress` or `completed,cancelled` to backend
- [x] **BUG FIX B7**: `app/customer/schedule/book.tsx` — route wrapper for BookAppointmentScreen (exists and working)
- [x] `app/customer/schedule/index.tsx` — appointment list entry
- [x] `app/technician/appointments.tsx` — staff view of workshop appointments, status advance UI
- [x] `app/technician/tracker.tsx` — job tracker for in-progress/completed appointments
- [x] `app/technician/index.tsx` — technician dashboard (today's jobs summary)

### M5 — Service Records (Mobile)
- [x] `features/records/types/records.types.ts`
- [x] `features/records/api/records.api.ts`
- [x] `features/records/queries/records.keys.ts, mutations.ts, queries.ts`
- [x] `features/records/components/RecordCard.tsx` — uses `workDone` + `totalCost`, left accent border, parts chips
- [x] `features/records/screens/RecordListScreen.tsx` — uses `useVehicleRecords(vehicleId)` with vehicleId prop
- [x] `features/records/screens/RecordDetailScreen.tsx`
- [x] `features/records/screens/AddRecordScreen.tsx`
- [x] `app/owner/jobs.tsx` — staff/owner view of service jobs for their workshop
- [x] `app/owner/create-record.tsx` — route wrapper for AddRecordScreen
- [x] `app/owner/index.tsx` — garage dashboard (summary stats, quick actions)
- [x] `app/owner/bookings.tsx` — garage: view/manage bookings (appointments)

### M6 — Reviews (Mobile)
- [x] `features/reviews/types/reviews.types.ts` — `userId` typed as union `string | { _id: string; fullName?: string; email: string }`
- [x] `features/reviews/api/reviews.api.ts`
- [x] `features/reviews/queries/reviews.keys.ts, mutations.ts, queries.ts` — `useWorkshopReviews` has `enabled: !!workshopId` guard
- [x] `features/reviews/components/ReviewCard.tsx` — avatar with initials, individual stars, populated userId name
- [x] `features/reviews/screens/ReviewListScreen.tsx`
- [ ] Create review form (rate + text) inside WorkshopDetailScreen or as modal
- [ ] Edit/delete own review UI

---

## Week 3 (12 Apr – 18 Apr) — Integration, UI Polish, Bug Fixes, Deploy

### Critical Bug Fixes (must complete before demo)
- [x] **B1**: Fix `getMyAppointments` in `appointment.controller.js` — separate `status` extraction from `paginate()` result; also support comma-separated values for multi-status queries
- [x] **B2**: Fixed `LoginScreen` — real login via `authApi.login()` + `signIn(token)`
- [x] **B3**: Fix `AppointmentListScreen` — pass `?status=` to backend (Upcoming = pending,confirmed,in_progress; Past = completed,cancelled)
- [x] **B4**: Fixed `WorkshopDetailScreen` — `workshop.specialization` → `workshop.servicesOffered`
- [x] **B5**: Fixed `WorkshopDetailScreen` — `description` field added to Workshop schema and createWorkshop/updateWorkshop controllers
- [x] **B6**: Create `app/customer/workshops/book/[id].tsx` → book route wired via WorkshopDetailScreen button (fixed route `/customer/schedule/book`)
- [x] **B7**: Create `app/customer/schedule/book.tsx` — route wrapper for BookAppointmentScreen (existed and working)

### Missing Screens (must complete for MVP)
- [x] BookAppointmentScreen route wiring — B7
- [x] Staff appointments screen — list all appointments for staff's workshop, advance status
- [x] Admin garages screen — CRUD workshop management (FIXED crash)
- [x] Admin users screen — list + deactivate users
- [x] Profile/home screen for customer (customer/index) — user info, quick stats
- [x] Garage dashboard screen (owner/index) — summary for workshop owners
- [x] Staff dashboard screen (technician/index) — today's jobs summary

### UI/UX Polish (enterprise-level)
- [x] All list screens use `Skeleton` loading states
- [x] All error states use `ErrorScreen` with retry (branded, with shadow)
- [x] Empty list states use `EmptyState` with icon (pull-to-refresh hint)
- [x] AppointmentCard — colour-coded status accent border
- [x] RecordCard — left brand border, LKR cost badge, parts chips
- [x] ReviewCard — avatar initials, star row, populated reviewer name
- [x] WorkshopCard — real district, real rating (shows `—` if 0), first service offered
- [x] Skeleton shimmer animation with Animated.loop
- [x] AppLogo SVG component — consistent across landing, login, register
- [x] Landing page — feature list card, stats row, hero ring, proper CTAs
- [x] Login + Register — theme-token colours, no hardcoded hex
- [ ] All forms validate fields and show inline errors before submit
- [ ] Pull-to-refresh on all list screens
- [ ] Haptic feedback on primary actions (Expo Haptics)
- [ ] Vehicle card shows image (fallback if no imageUrl)
- [ ] Vehicle image upload UI (expo-image-picker → POST /vehicles/:id/image)

### Security Hardening Checklist
- [ ] Confirm express-validator chains on every POST and PUT route
- [ ] Confirm JWKS client has cache enabled (min 10-min cacheMaxAge)
- [ ] Confirm helmet() applied before all routes
- [ ] Confirm CORS uses explicit `ALLOWED_ORIGINS` from env — no wildcard
- [ ] Confirm no secrets in any .js or .ts source file
- [ ] Confirm .env is in .gitignore and not committed
- [ ] Role guards return 403 for insufficient permissions (test each role)
- [ ] Stack traces never reach client (test 500 in production mode)

### Integration / End-to-End Testing
- [ ] Register new user → appears in Asgardeo and MongoDB
- [ ] Login → token stored → sync-profile → dashboard (all 4 roles: customer, workshop_owner, workshop_staff, admin)
- [ ] Customer: add vehicle → edit vehicle → view detail → delete (soft) → vehicle gone from list
- [ ] Customer: find nearby workshops → view detail → book appointment → view in schedule
- [ ] Staff: see appointment → advance status (pending→confirmed→in_progress→completed)
- [ ] Staff: create service record for vehicle
- [ ] Customer: view service history for vehicle
- [ ] Customer: write review for workshop → averageRating updates on workshop card
- [ ] Admin: view all users → deactivate a user → user cannot log in
- [ ] Admin: create workshop → appears in list + nearby search

### Deployment
- [ ] Backend deployed to Render.com — GET /health returns 200
- [ ] MongoDB Atlas M0 connected and indexed
- [ ] R2 bucket accessible — test image upload end-to-end
- [ ] `EXPO_PUBLIC_API_URL` points to Render URL
- [ ] Test entire flow on physical device (not simulator) with Render backend
- [ ] Postman collection covering all endpoints with example requests/responses

### Documentation & Viva Prep
- [ ] CLAUDE.md complete and accurate
- [ ] README.md covers setup steps, env vars, and deployment
- [ ] Each member can explain their controller logic, route design, and data validation
- [ ] Each member can explain how their module integrates with others
- [ ] Each member can demo their screens on device
- [ ] System architecture diagram created
- [ ] Database schema diagram created
- [ ] API endpoint table formatted for report submission
