# SE2020 – Web and Mobile Technologies: Group Assignment

**Faculty of Computing**  
**BSc (Hons) in Software Engineering**  
**Year 2 Semester 2 (2026)**  

| Detail | Information |
| :--- | :--- |
| **Weight** | 20% (Marked out of 100 and scaled) |
| **Group Size** | 6 Students |
| **Duration** | 8 Weeks |

---

## 1. Assignment Overview

Students must design and develop a **Full Stack Mobile Application** utilizing:
- **Frontend**: React Native
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Deployment**: Any cloud hosting platform (AWS, Render, Railway, etc.)

---

## 2. Core System Requirements (Mandatory)

Every group project must include the following minimum functional and technical standards:

### 2.1 User Authentication
- User Registration & Login
- Password Hashing & JWT-based authentication
- Protected Routes (role-based access)

### 2.2 Hosting & Deployment
- Backend must be hosted online (Localhost demos are not allowed).
- Mobile app must connect to the live hosted API.

---

## 3. Workload Distribution

Each of the 6 members must handle a clearly defined module covering both the Backend logic and the Mobile UI.

### 3.1 Group Responsibility: Authentication
- Registration & Login APIs
- Password Security & Token Management

### 3.2 Individual Responsibility: Core Entity CRUD
Each member is responsible for:
- Full CRUD backend for a main entity
- File upload integration
- Mobile UI frontend
- API Controllers & Routes
- Comprehensive Testing

---

## 4. Technical Specifications

### Backend Requirements
- RESTful API design with proper folder structure.
- Implementation of middleware (Auth, Rate Limiting, Error Handling).
- Standardized HTTP status codes and response shapes.

### Mobile Requirements
- Proper navigation (Stack/Tab routing).
- Functional components & custom hooks.
- Form validation & API integration.
- **Zero hardcoded data** (all content from backend).

---

## 5. Marking Criteria

### A. Technical Implementation (40 Marks)
Assessed via Git history, system testing, and module ownership verification.

### B. Individual Viva (60 Marks)
Each student will be questioned individually on the following:

| Criteria | Description | Marks |
| :--- | :--- | :--- |
| **Module Explanation** | Logic, functions, and data flow of your own module. | 20 |
| **Integration** | Understanding how your module connects to the system. | 10 |
| **Backend & DB** | Understanding of schema, routes, and controllers. | 10 |
| **Mobile & API** | Understanding request flow and UI behavior. | 10 |
| **Problem Solving** | Ability to handle "what if" scenarios and debug. | 10 |
| **Total** | | **60** |

---

# VSRMS — Vehicle Service & Repair Management System
**Official Project Plan & Member Mapping**

## Project Goal
To develop a high-end Vehicle Service & Repair Management System (VSRMS) connecting owners with regional workshops, optimized for Sri Lanka.

## Module Distribution (M1 - M6)

| ID | Module Name | Primary Responsibilities |
| :--- | :--- | :--- |
| **M1** | **Auth & Admin** | Asgardeo OIDC flow, role guards, admin user management, and profile center. |
| **M2** | **Vehicles** | Full vehicle CRUD, soft delete, and Cloudflare R2 image pipeline for vehicles. |
| **M3** | **Workshops** | Workshop management, GeoJSON nearby search, and R2 image pipeline for garages. |
| **M4** | **Appointments** | Booking CRUD, status state machine, and double-booking prevention. |
| **M5** | **Service Logs** | Record management, workshop history list, and technician access control. |
| **M6** | **Reviews** | Ratings CRUD, average rating aggregation, and review enforcement. |

## Shared Infrastructure
- **R2 Pipeline**: Shared utility for image uploads located in `src/middleware/upload.js`. M2 and M3 implement specific wiring for their respective entities.
- **UI System**: Unified Dark Header / Elevated White Card design system applied across all modules.

---

# VSRMS — Completion Status Audit
**As of 2026-04-13 | Assessed against original Architecture & Design Document v2.0**

---

## Summary Table

| Member | Module | Backend | Mobile UI | Overall | Status |
|--------|--------|---------|-----------|---------|--------|
| M1 | Auth & User Management | 100% | 80% | **90%** | Nearly complete — Profile Edit UI missing |
| M2 | Vehicle Management | 100% | 95% | **98%** | Essentially complete |
| M3 | Workshop Management + Location | 100% | 95% | **98%** | Essentially complete |
| M4 | Appointment Booking | 100% | 60% | **80%** | Backend done; Detail, Edit, Cancel UI missing |
| M5 | Service Records & History | 100% | 70% | **85%** | Backend done; Edit and Delete UI missing |
| M6 | Ratings, Reviews & Image Upload | 100% | 70% | **85%** | Backend done; Edit and Delete Review UI missing |

---

## M1 — Auth & User Management

### Backend (100%)
All 7 endpoints implemented and working:

| Endpoint | Status | Notes |
|----------|--------|-------|
| POST /auth/login | Done | ROPC proxy to Asgardeo; returns access_token |
| POST /auth/register | Done | SCIM2 user creation in Asgardeo |
| POST /auth/sync-profile | Done | Upserts MongoDB User on every login |
| GET /auth/me | Done | Returns own MongoDB user document |
| PUT /auth/me | Done | Updates fullName and phone |
| GET /auth/users | Done | Admin-only paginated user list |
| DELETE /auth/users/:id | Done | Soft-deactivate (active: false); cannot deactivate self |

### Mobile UI (80%)
| Screen | Status | Notes |
|--------|--------|-------|
| Login Screen | Done | Real `POST /auth/login` → `signIn(token)` flow |
| Register Screen | Done | Calls `POST /auth/register`; branded premium UI |
| Profile View (customer/index.tsx) | Done | Shows name, role badge, stats, sign-out |
| Admin User List | Done | Paginated list, role badges, deactivate action |
| **Profile Edit UI** | **Missing** | `PUT /auth/me` API and mutation hook are wired, but no edit screen/modal exists in the UI |

### What is Missing
- A dedicated Profile Edit screen (or edit modal in customer/index) to call `PUT /auth/me` — user cannot currently change their name or phone number from the app.

---

## M2 — Vehicle Management

### Backend (100%)
All 6 endpoints implemented:

| Endpoint | Status |
|----------|--------|
| POST /vehicles | Done |
| GET /vehicles | Done — lists own non-deleted vehicles |
| GET /vehicles/:id | Done — ownership enforced (403) |
| PUT /vehicles/:id | Done — ownership enforced |
| DELETE /vehicles/:id | Done — soft delete (sets deletedAt) |
| POST /vehicles/:id/image | Done — Multer + R2; saves imageUrl |

### Mobile UI (95%)
| Screen | Status |
|--------|--------|
| My Vehicles list | Done |
| Add Vehicle | Done — vehicle type grid, per-field validation |
| Vehicle Detail | Done — real service records via `useVehicleRecords` |
| Edit Vehicle | Done — locked reg number banner |
| Delete confirm | Done — soft delete wired |
| Image upload | Done — expo-image-picker → POST /vehicles/:id/image |

### What is Missing
- Inline form validation error messages (validates on submit but no per-field red text below inputs).
- Pull-to-refresh on VehicleListScreen.

---

## M3 — Workshop Management + Location

### Backend (100% — plus extras beyond spec)
All 7 original endpoints implemented, plus 4 additional endpoints added:

| Endpoint | Status | In Original Spec? |
|----------|--------|-------------------|
| POST /workshops | Done | Yes |
| GET /workshops | Done + `?name=` search added | Yes |
| GET /workshops/nearby | Done + `?name=` search added | Yes |
| GET /workshops/:id | Done | Yes |
| PUT /workshops/:id | Done | Yes |
| DELETE /workshops/:id | Done (soft delete, active: false) | Yes |
| POST /workshops/:id/image | Done | Yes |
| GET /workshops/mine | Done | **Extra** — owner sees own workshops |
| GET /workshops/:id/technicians | Done | **Extra** — list assigned staff |
| POST /workshops/:id/technicians | Done | **Extra** — assign technician |
| DELETE /workshops/:id/technicians/:userId | Done | **Extra** — remove technician |

### Mobile UI (95%)
| Screen | Status | Notes |
|--------|--------|-------|
| Browse Workshops (WorkshopListScreen) | Done | 25 Sri Lanka district chips, `?district=` to backend |
| Workshop Detail | Done | servicesOffered, description, averageRating, reviews section |
| Write Review modal | Done | Tap-to-select stars + text; customer role only; wired to `useCreateReview` |
| Nearby Map View (NearbyWorkshopsScreen) | Done | Full advanced map + animated list panel; snap carousel synced to markers |
| Admin Add/Edit Workshop (AdminGaragesScreen) | Done | Location field + all required fields; fixed crash |
| Owner Workshop CRUD (owner/workshops/) | Done | Map-based location picker, all fields, create/edit |
| Owner Workshop Image Upload | Done | expo-image-picker → POST /workshops/:id/image |
| Technician Management | Done | Owner can add/remove staff from workshop |

### What is Missing
- Pull-to-refresh on WorkshopListScreen and NearbyWorkshopsScreen list panel.

---

## M4 — Appointment Booking

### Backend (100%)
All 6 endpoints implemented:

| Endpoint | Status | Notes |
|----------|--------|-------|
| POST /appointments | Done | Past-date validation; double-booking 409 check |
| GET /appointments/mine | Done | Supports comma-separated `?status=` values |
| GET /appointments/:id | Done | Ownership/role enforced |
| PUT /appointments/:id | Done | Reschedule while pending only |
| PUT /appointments/:id/status | Done | Staff/admin only; state machine enforced |
| DELETE /appointments/:id | Done | Cancel while pending only |

### Mobile UI (60%)
| Screen | Status | Notes |
|--------|--------|-------|
| Book Appointment (BookAppointmentScreen) | Done | Workshop pre-fill, date input, service picker |
| My Appointments (AppointmentListScreen) | Done | Upcoming/Past tabs; comma-separated status to backend |
| **Appointment Detail Screen** | **Missing** | No screen to view a single appointment's full details |
| **Edit / Reschedule Booking** | **Missing** | `PUT /appointments/:id` API is wired but no reschedule UI exists |
| **Cancel Confirm UI** | **Missing** | `deleteAppointment` mutation is defined but no cancel button in the list or detail |
| Staff Appointments view | Done | `app/technician/appointments.tsx` — list + status advance |
| Staff Job Tracker | Done | `app/technician/tracker.tsx` — in-progress/completed jobs |

### What is Missing
- AppointmentDetailScreen (tap an appointment to see full details).
- Edit/Reschedule screen (only available while `status === pending`).
- Cancel confirmation button in the list (customer can only cancel pending appointments; the mutation exists but is unreachable from the UI).

---

## M5 — Service Records & History

### Backend (100%)
All 5 endpoints implemented:

| Endpoint | Status | Notes |
|----------|--------|-------|
| POST /records | Done | Staff only; links to appointment + vehicle |
| GET /records/vehicle/:vehicleId | Done | Ownership enforced (owners see own vehicles only) |
| GET /records/:id | Done | Same ownership rule |
| PUT /records/:id | Done | Staff only |
| DELETE /records/:id | Done | Admin only |

### Mobile UI (70%)
| Screen | Status | Notes |
|--------|--------|-------|
| Service History List (RecordListScreen) | Done | Uses `useVehicleRecords(vehicleId)` |
| Record Detail (RecordDetailScreen) | Done | workDone, parts chips, LKR cost, technician |
| Create Record (AddRecordScreen) | Done | Staff/owner; wired to `POST /records` |
| **Edit Record Screen** | **Missing** | `PUT /records/:id` API exists; no EditRecordScreen or edit button in UI |
| **Delete Record confirm** | **Missing** | `DELETE /records/:id` API exists; no delete UI for admin |
| Owner Jobs view | Done | `app/owner/jobs.tsx` — lists workshop's service records |
| Technician Record entry | Done | `app/technician/record.tsx` |

### What is Missing
- EditRecordScreen (staff updates cost, parts, notes after the fact).
- Delete Record confirmation UI for admin.

---

## M6 — Ratings, Reviews & Image Upload

### Backend (100%)
All 6 review endpoints implemented; R2 image pipeline owns the shared upload infrastructure:

| Endpoint | Status | Notes |
|----------|--------|-------|
| POST /reviews | Done | Saves review; recalculates workshop averageRating |
| GET /reviews/workshop/:workshopId | Done | Paginated, newest first |
| GET /reviews/mine | Done | Own reviews paginated |
| GET /reviews/:id | Done | Single review |
| PUT /reviews/:id | Done | Ownership enforced; recalculates rating |
| DELETE /reviews/:id | Done | Ownership enforced; recalculates rating |
| R2 Image Upload Pipeline | Done | Shared Multer + R2 SDK utility; wired for vehicles (M2) and workshops (M3) |

### Mobile UI (70%)
| Screen | Status | Notes |
|--------|--------|-------|
| Write Review modal | Done | 5-star tap rating + text in WorkshopDetailScreen; customer only |
| Workshop Reviews List | Done | ReviewListScreen inside WorkshopDetailScreen |
| My Reviews (ReviewListScreen) | Done | Own reviews with rating stars and reviewer name |
| **Edit Review UI** | **Missing** | `PUT /reviews/:id` API + mutation exist but no edit button/modal in UI |
| **Delete Review UI** | **Missing** | `DELETE /reviews/:id` API + mutation exist but no delete button in UI |

### What is Missing
- Edit Review modal or screen (customer taps own review → edits rating + text).
- Delete Review confirmation (customer removes their own review).

---

## Additional Work Done Beyond Original Spec

The following features were implemented on top of what the original Architecture & Design Document v2.0 specified:

| Feature | Module | Description |
|---------|--------|-------------|
| Workshop owner self-management | M3 | Owners can create, edit, and image-upload their own workshops (original spec: Admin only) |
| Technician management UI | M3 | Owner can assign/remove staff per workshop via `/workshops/:id/technicians` |
| Advanced Map + List view | M3 | Snap carousel, animated bottom panel, marker focus sync, dual data sources |
| District filter chips | M3 | 25 Sri Lanka district chips in WorkshopListScreen (original spec had no district filter UI) |
| Backend `?name=` search | M3 | Both `GET /workshops` and `GET /workshops/nearby` support name search |
| Write Review inline modal | M6 | Embedded in WorkshopDetailScreen instead of a separate screen |
| Custom Animated Tab Bar | Shared | Sliding pill indicator for premium tab navigation |
| AvatarMenu modal | Shared | Consolidates Settings and Sign Out into a modal instead of extra tabs |
| Skeleton loading states | Shared | Shimmer pulse on every list while loading (original spec: ActivityIndicator) |
| Branded landing page | Shared | Feature list card, animated ring hero, stats row |
| AppLogo SVG component | Shared | Consistent across landing, login, register |
| Feature-slice architecture | Shared | `api/` / `queries/` / `screens/` / `components/` / `types/` per domain |
| `description` field on Workshop | M3/M5 | Added to schema, createWorkshop, updateWorkshop (original spec omitted it) |
| 25 Sri Lanka districts | M3 | Hardcoded list of all districts for the filter chip UI |
| `GET /workshops/mine` endpoint | M3 | Owner-facing; original spec had no owner-filtered workshop list |

---

## Remaining Work Before Demo (Priority Order)

### Must-Have (blocks demo flow)
1. **M4** — AppointmentDetailScreen (customer taps appointment → full detail view)
2. **M4** — Cancel Appointment button in AppointmentListScreen (pending only; calls `useDeleteAppointment`)
3. **M1** — Profile Edit modal in customer/index.tsx (calls `PUT /auth/me` for name + phone)

### Should-Have (viva examiner will look)
4. **M4** — Edit/Reschedule Booking screen (date + serviceType change while pending)
5. **M5** — EditRecordScreen (staff updates cost, parts, notes)
6. **M6** — Edit + Delete Review UI on My Reviews screen

### Nice-to-Have (polish)
7. Inline form validation error text below each input on all forms
8. Pull-to-refresh (`onRefresh={refetch}`) on all FlashList screens
9. Delete Record admin UI

### Infrastructure (required for submission)
10. Backend deployed to Render.com (GET /health → `{ status: "ok" }`)
11. `EXPO_PUBLIC_API_URL` set to Render URL in vsrms-mobile/.env
12. Security hardening checklist pass (express-validator chains, CORS origins, no secrets in source)
13. Postman collection covering all endpoints
14. README.md covering setup, env vars, and deployment steps