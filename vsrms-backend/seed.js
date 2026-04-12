'use strict';

/**
 * VSRMS MongoDB Seed Script
 * Usage:  node seed.js   OR   npm run seed
 *
 * Creates:
 *   - 1 admin
 *   - 2 workshop owners (each linked to 1 of the first 2 workshops)
 *   - 6 technicians (3 per workshop, linked to first 2 workshops)
 *   - 10 customers
 *   - 20 workshops across Sri Lanka
 *   - 20 vehicles (2 per customer)
 *   - 10 appointments (1 vehicle per customer currently in repair)
 *   - 10 service records for those appointments
 *   - 10 reviews from customers
 *
 * Safe to re-run — deletes previous seed users by asgardeoSub first.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User          = require('./src/models/User');
const Workshop      = require('./src/models/Workshop');
const Vehicle       = require('./src/models/Vehicle');
const Appointment   = require('./src/models/Appointment');
const ServiceRecord = require('./src/models/ServiceRecord');
const Review        = require('./src/models/Review');

// ─── Helpers ───────────────────────────────────────────────────────────────────
const pastDays = (n) => new Date(Date.now() - n * 86_400_000);
const futureDays = (n) => new Date(Date.now() + n * 86_400_000);

// ─── 20 Workshops across Sri Lanka ────────────────────────────────────────────
const WORKSHOPS = [
  // 0 — Owner 1's workshop
  {
    name: 'AutoFix Pro Colombo',
    location: { type: 'Point', coordinates: [79.8612, 6.9271] },
    address: '12 Galle Road, Colombo 03',
    district: 'Colombo',
    servicesOffered: ['Engine Repair', 'Brake Service', 'Oil Change', 'Tire Rotation', 'AC Repair'],
    description: 'Premier auto repair workshop in Colombo with 15+ years of experience. Specialists in Japanese and European vehicles.',
    contactNumber: '+94 11 234 5678',
  },
  // 1 — Owner 2's workshop
  {
    name: 'Lanka Motors Kandy',
    location: { type: 'Point', coordinates: [80.6337, 7.2906] },
    address: '88 Peradeniya Road, Kandy',
    district: 'Kandy',
    servicesOffered: ['Full Service', 'Transmission Repair', 'Electrical Diagnostics', 'Body Work', 'Wheel Alignment'],
    description: 'Family-owned workshop in Kandy providing reliable and affordable vehicle maintenance since 1998.',
    contactNumber: '+94 81 222 3344',
  },
  // 2–19 — Additional workshops
  {
    name: 'Precision Garage Galle',
    location: { type: 'Point', coordinates: [80.2170, 6.0329] },
    address: '34 Main Street, Galle Fort',
    district: 'Galle',
    servicesOffered: ['Suspension Repair', 'Engine Diagnostics', 'Air Conditioning', 'Battery Service', 'Detailing'],
    description: 'Modern facility in Galle equipped with latest diagnostic tools for all vehicle makes and models.',
    contactNumber: '+94 91 333 4455',
  },
  {
    name: 'Matara Auto Works',
    location: { type: 'Point', coordinates: [80.5353, 5.9549] },
    address: '22 Beach Road, Matara',
    district: 'Matara',
    servicesOffered: ['Oil Change', 'Brake Repair', 'Clutch Replacement', 'Tyre Service'],
    description: 'Trusted workshop serving Matara and surrounding areas for over a decade.',
    contactNumber: '+94 41 222 1133',
  },
  {
    name: 'Negombo Speed Garage',
    location: { type: 'Point', coordinates: [79.8378, 7.2008] },
    address: '5 Lewis Place, Negombo',
    district: 'Gampaha',
    servicesOffered: ['Full Service', 'Wheel Alignment', 'Engine Tuning', 'Exhaust Repair'],
    description: 'Fast turnaround service near Negombo with certified mechanics.',
    contactNumber: '+94 31 222 5566',
  },
  {
    name: 'Ratnapura Service Center',
    location: { type: 'Point', coordinates: [80.3997, 6.6828] },
    address: '14 Colombo Road, Ratnapura',
    district: 'Ratnapura',
    servicesOffered: ['Engine Overhaul', 'AC Repair', 'Battery Replacement', 'Electrical Work'],
    description: 'Full-service workshop in the gem city, servicing all vehicle types.',
    contactNumber: '+94 45 222 7788',
  },
  {
    name: 'Kurunegala Auto Hub',
    location: { type: 'Point', coordinates: [80.3644, 7.4818] },
    address: '77 North Circular Road, Kurunegala',
    district: 'Kurunegala',
    servicesOffered: ['Brake Service', 'Suspension Work', 'Tire Fitting', 'Body Repairs'],
    description: 'Comprehensive vehicle care center in Kurunegala town.',
    contactNumber: '+94 37 222 9900',
  },
  {
    name: 'Anuradhapura Motors',
    location: { type: 'Point', coordinates: [80.3989, 8.3114] },
    address: '19 Kandy Road, Anuradhapura',
    district: 'Anuradhapura',
    servicesOffered: ['Oil Change', 'Engine Repair', 'Gear Box Service', 'Air Filter Replacement'],
    description: 'Reliable mechanics serving the North Central Province.',
    contactNumber: '+94 25 222 4455',
  },
  {
    name: 'Polonnaruwa Garage',
    location: { type: 'Point', coordinates: [81.0001, 7.9403] },
    address: '8 Batticaloa Road, Polonnaruwa',
    district: 'Polonnaruwa',
    servicesOffered: ['Tire Service', 'Battery Replacement', 'Engine Diagnostics', 'Clutch Work'],
    description: 'Your trusted partner for vehicle maintenance in Polonnaruwa.',
    contactNumber: '+94 27 222 3322',
  },
  {
    name: 'Jaffna Top Gear',
    location: { type: 'Point', coordinates: [80.0137, 9.6615] },
    address: '45 Hospital Road, Jaffna',
    district: 'Jaffna',
    servicesOffered: ['Full Service', 'AC Service', 'Electrical Repairs', 'Painting & Body Work'],
    description: 'Northern Sri Lanka\'s premier auto repair destination.',
    contactNumber: '+94 21 222 6677',
  },
  {
    name: 'Trincomalee Fleet Care',
    location: { type: 'Point', coordinates: [81.2335, 8.5874] },
    address: '33 Dockyard Road, Trincomalee',
    district: 'Trincomalee',
    servicesOffered: ['Fleet Maintenance', 'Diesel Engine Service', 'Brake Overhaul', 'Suspension'],
    description: 'Specialising in fleet vehicles and heavy-duty maintenance.',
    contactNumber: '+94 26 222 8899',
  },
  {
    name: 'Batticaloa Expert Motors',
    location: { type: 'Point', coordinates: [81.6924, 7.7170] },
    address: '12 Bar Road, Batticaloa',
    district: 'Batticaloa',
    servicesOffered: ['Engine Repair', 'Gear Repair', 'Electrical Diagnostics', 'Cooling System'],
    description: 'Expert mechanics with 20 years of experience in Batticaloa.',
    contactNumber: '+94 65 222 1100',
  },
  {
    name: 'Ampara Auto Care',
    location: { type: 'Point', coordinates: [81.6724, 7.2993] },
    address: '5 DS Senanayake Mawatha, Ampara',
    district: 'Ampara',
    servicesOffered: ['Oil Change', 'Tyre Fitting', 'Air Conditioning', 'Battery Service'],
    description: 'Affordable and efficient vehicle maintenance in Ampara.',
    contactNumber: '+94 63 222 3344',
  },
  {
    name: 'Badulla Hill Country Garage',
    location: { type: 'Point', coordinates: [81.0558, 6.9895] },
    address: '28 Passara Road, Badulla',
    district: 'Badulla',
    servicesOffered: ['Brake Service', 'Engine Tuning', 'Clutch Repair', 'Exhaust Work'],
    description: 'Specialised in mountain road vehicles and hill country driving conditions.',
    contactNumber: '+94 55 222 5566',
  },
  {
    name: 'Nuwara Eliya Motors',
    location: { type: 'Point', coordinates: [80.7650, 6.9497] },
    address: '14 Grand Hotel Road, Nuwara Eliya',
    district: 'Nuwara Eliya',
    servicesOffered: ['Full Service', 'Heating System', 'Engine Overhaul', 'Tire Chain Fitting'],
    description: 'High-altitude vehicle care specialists. Serving the hill station since 2005.',
    contactNumber: '+94 52 222 7788',
  },
  {
    name: 'Hambantota Wheels & More',
    location: { type: 'Point', coordinates: [81.1185, 6.1242] },
    address: '9 Siribopura Road, Hambantota',
    district: 'Hambantota',
    servicesOffered: ['Tyre Service', 'Wheel Alignment', 'Body Work', 'AC Repair'],
    description: 'Modern workshop in the southern development hub of Sri Lanka.',
    contactNumber: '+94 47 222 9900',
  },
  {
    name: 'Kegalle Quick Fix',
    location: { type: 'Point', coordinates: [80.3500, 7.2500] },
    address: '3 Kandy Road, Kegalle',
    district: 'Kegalle',
    servicesOffered: ['Oil Change', 'Brake Pads', 'Battery', 'Tyre Rotation', 'Engine Check'],
    description: 'Quick and reliable service on the Kandy-Colombo highway.',
    contactNumber: '+94 35 222 1122',
  },
  {
    name: 'Kalutara Coastal Garage',
    location: { type: 'Point', coordinates: [79.9607, 6.5854] },
    address: '56 Galle Road, Kalutara South',
    district: 'Kalutara',
    servicesOffered: ['Full Service', 'Rust Treatment', 'AC Service', 'Electrical Work'],
    description: 'Coastal vehicle specialists — protecting your vehicle from salt air corrosion.',
    contactNumber: '+94 34 222 3344',
  },
  {
    name: 'Puttalam North Garage',
    location: { type: 'Point', coordinates: [79.8405, 8.0362] },
    address: '21 Colombo Road, Puttalam',
    district: 'Puttalam',
    servicesOffered: ['Engine Repair', 'Gear Box', 'Fuel System', 'Suspension'],
    description: 'Trusted workshop for fishing fleet and local vehicles in Puttalam.',
    contactNumber: '+94 32 222 5566',
  },
  {
    name: 'Vavuniya Service Station',
    location: { type: 'Point', coordinates: [80.4971, 8.7514] },
    address: '10 Horowpotana Road, Vavuniya',
    district: 'Vavuniya',
    servicesOffered: ['Diesel Service', 'Engine Overhaul', 'Brake System', 'Air Filter'],
    description: 'Full-service station in Vavuniya — gateway to the North.',
    contactNumber: '+94 24 222 7788',
  },
];

// ─── Users ─────────────────────────────────────────────────────────────────────
const ADMIN = [
  { asgardeoSub: 'seed-admin-001', fullName: 'Admin Nimal Silva', email: 'admin@vsrms.lk', role: 'admin', active: true },
];

const OWNERS = [
  { asgardeoSub: 'seed-owner-001', fullName: 'Roshan Fernando',  email: 'roshan@autofix.lk',    role: 'workshop_owner', active: true },
  { asgardeoSub: 'seed-owner-002', fullName: 'Thilak Bandara',   email: 'thilak@lankamotors.lk', role: 'workshop_owner', active: true },
];

// 3 technicians for Workshop 0 (AutoFix Pro), 3 for Workshop 1 (Lanka Motors)
const TECHNICIANS = [
  { asgardeoSub: 'seed-tech-001', fullName: 'Kamal Silva',        email: 'kamal@autofix.lk',       role: 'workshop_staff', active: true, wsIdx: 0 },
  { asgardeoSub: 'seed-tech-002', fullName: 'Nuwan Perera',       email: 'nuwan@autofix.lk',        role: 'workshop_staff', active: true, wsIdx: 0 },
  { asgardeoSub: 'seed-tech-003', fullName: 'Asanka Jayawardena', email: 'asanka@autofix.lk',       role: 'workshop_staff', active: true, wsIdx: 0 },
  { asgardeoSub: 'seed-tech-004', fullName: 'Pradeep Kumara',     email: 'pradeep@lankamotors.lk',  role: 'workshop_staff', active: true, wsIdx: 1 },
  { asgardeoSub: 'seed-tech-005', fullName: 'Chaminda Rajapaksha',email: 'chaminda@lankamotors.lk', role: 'workshop_staff', active: true, wsIdx: 1 },
  { asgardeoSub: 'seed-tech-006', fullName: 'Dilshan Wickrama',   email: 'dilshan@lankamotors.lk',  role: 'workshop_staff', active: true, wsIdx: 1 },
];

const CUSTOMERS = [
  { asgardeoSub: 'seed-cust-001', fullName: 'Amara Jayawardena',    email: 'amara@gmail.com',    phone: '+94 77 111 2233', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-002', fullName: 'Ishara Pathirana',     email: 'ishara@gmail.com',   phone: '+94 71 222 3344', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-003', fullName: 'Dinesh Samarasinghe',  email: 'dinesh@gmail.com',   phone: '+94 76 333 4455', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-004', fullName: 'Nalini Wickramaratne', email: 'nalini@gmail.com',   phone: '+94 78 444 5566', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-005', fullName: 'Chamara Dissanayake',  email: 'chamara@gmail.com',  phone: '+94 72 555 6677', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-006', fullName: 'Sanduni Mendis',       email: 'sanduni@gmail.com',  phone: '+94 75 666 7788', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-007', fullName: 'Ruwan Gunasekara',     email: 'ruwan@gmail.com',    phone: '+94 70 777 8899', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-008', fullName: 'Tharanga Rajapaksha',  email: 'tharanga@gmail.com', phone: '+94 77 888 9900', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-009', fullName: 'Manjula Senanayake',   email: 'manjula@gmail.com',  phone: '+94 71 999 0011', role: 'customer', active: true },
  { asgardeoSub: 'seed-cust-010', fullName: 'Prasad Liyanage',      email: 'prasad@gmail.com',   phone: '+94 76 000 1122', role: 'customer', active: true },
];

// ─── Vehicles: 2 per customer (20 total) ──────────────────────────────────────
// Index i  → customer[i]'s FIRST vehicle  (the one going to repair — appointment exists)
// Index i+10 → customer[i]'s SECOND vehicle  (no active appointment)
const VEHICLES_PRIMARY = [
  { registrationNo: 'WP-CAR-1001', make: 'Toyota',     model: 'Corolla',   year: 2019, vehicleType: 'car',        mileage: 48500 },
  { registrationNo: 'WP-CAR-1002', make: 'Honda',      model: 'Civic',     year: 2020, vehicleType: 'car',        mileage: 32000 },
  { registrationNo: 'CP-VAN-1003', make: 'Toyota',     model: 'Hiace',     year: 2017, vehicleType: 'van',        mileage: 95000 },
  { registrationNo: 'SP-CAR-1004', make: 'Suzuki',     model: 'Swift',     year: 2021, vehicleType: 'car',        mileage: 18000 },
  { registrationNo: 'WP-MOT-1005', make: 'Honda',      model: 'CB150R',    year: 2022, vehicleType: 'motorcycle', mileage:  8500 },
  { registrationNo: 'NW-CAR-1006', make: 'Nissan',     model: 'Sunny',     year: 2018, vehicleType: 'car',        mileage: 61000 },
  { registrationNo: 'SG-TUK-1007', make: 'Bajaj',      model: 'RE 4S',     year: 2020, vehicleType: 'tuk',        mileage: 44000 },
  { registrationNo: 'WP-CAR-1008', make: 'Mazda',      model: 'Demio',     year: 2019, vehicleType: 'car',        mileage: 37500 },
  { registrationNo: 'CP-CAR-1009', make: 'Mitsubishi', model: 'Lancer',    year: 2016, vehicleType: 'car',        mileage: 82000 },
  { registrationNo: 'EP-VAN-1010', make: 'Suzuki',     model: 'Every',     year: 2021, vehicleType: 'van',        mileage: 22000 },
];

const VEHICLES_SECONDARY = [
  { registrationNo: 'WP-MOT-2001', make: 'Yamaha',     model: 'FZ-S',      year: 2021, vehicleType: 'motorcycle', mileage: 12000 },
  { registrationNo: 'WP-CAR-2002', make: 'Suzuki',     model: 'Alto',      year: 2022, vehicleType: 'car',        mileage:  5500 },
  { registrationNo: 'CP-CAR-2003', make: 'Honda',      model: 'Fit',       year: 2018, vehicleType: 'car',        mileage: 42000 },
  { registrationNo: 'SP-MOT-2004', make: 'Bajaj',      model: 'Pulsar 150',year: 2020, vehicleType: 'motorcycle', mileage: 28000 },
  { registrationNo: 'WP-CAR-2005', make: 'Toyota',     model: 'Vitz',      year: 2019, vehicleType: 'car',        mileage: 31000 },
  { registrationNo: 'NW-TUK-2006', make: 'Bajaj',      model: 'RE 4S',     year: 2021, vehicleType: 'tuk',        mileage: 19000 },
  { registrationNo: 'SG-CAR-2007', make: 'Hyundai',    model: 'i10',       year: 2020, vehicleType: 'car',        mileage: 24000 },
  { registrationNo: 'WP-VAN-2008', make: 'Nissan',     model: 'Caravan',   year: 2015, vehicleType: 'van',        mileage: 110000 },
  { registrationNo: 'CP-CAR-2009', make: 'Honda',      model: 'Vezel',     year: 2017, vehicleType: 'car',        mileage: 55000 },
  { registrationNo: 'EP-CAR-2010', make: 'Toyota',     model: 'Prius',     year: 2016, vehicleType: 'car',        mileage: 78000 },
];

// ─── Appointments: 1 per customer (primary vehicle in repair) ─────────────────
// Alternating workshops 0 and 1 (AutoFix and Lanka Motors have staff)
const APPOINTMENTS = [
  { serviceType: 'Oil Change',             status: 'in_progress', scheduledDate: pastDays(1),  notes: 'Full synthetic oil 5W-30 requested',     wsIdx: 0, techIdx: 0 },
  { serviceType: 'Brake Service',          status: 'in_progress', scheduledDate: pastDays(1),  notes: 'Front brake pads worn out',              wsIdx: 1, techIdx: 3 },
  { serviceType: 'Engine Diagnostics',     status: 'in_progress', scheduledDate: pastDays(2),  notes: 'Check engine light on for 3 days',       wsIdx: 0, techIdx: 1 },
  { serviceType: 'AC Repair',              status: 'in_progress', scheduledDate: pastDays(2),  notes: 'AC not cooling, possible refrigerant leak', wsIdx: 1, techIdx: 4 },
  { serviceType: 'Suspension Inspection',  status: 'in_progress', scheduledDate: pastDays(1),  notes: 'Vehicle pulling to the left',            wsIdx: 0, techIdx: 2 },
  { serviceType: 'Transmission Repair',    status: 'confirmed',   scheduledDate: futureDays(1),notes: 'Gear slipping in 3rd gear',              wsIdx: 1, techIdx: 3 },
  { serviceType: 'Full Service',           status: 'confirmed',   scheduledDate: futureDays(1),notes: '60,000 km major service due',             wsIdx: 0, techIdx: 0 },
  { serviceType: 'Battery Replacement',    status: 'pending',     scheduledDate: futureDays(3),notes: 'Battery not holding charge overnight',    wsIdx: 1, techIdx: 5 },
  { serviceType: 'Wheel Alignment',        status: 'pending',     scheduledDate: futureDays(4),notes: 'Uneven tyre wear noticed',                wsIdx: 0, techIdx: 1 },
  { serviceType: 'Electrical Diagnostics', status: 'pending',     scheduledDate: futureDays(5),notes: 'Multiple dashboard warning lights on',   wsIdx: 1, techIdx: 4 },
];

// ─── Service records for in_progress appointments (first 5) ───────────────────
const RECORDS = [
  {
    workDone: 'Drained old oil (5W-30 mineral), replaced with 5W-30 full synthetic. New oil filter and drain plug washer installed. Reset oil service indicator.',
    partsReplaced: ['Oil filter', 'Drain plug washer', '4L synthetic oil'],
    totalCost: 4800,
    mileageAtService: 48000,
    techIdx: 0,
  },
  {
    workDone: 'Replaced all four brake pads (front and rear). Resurfaced front rotors. Checked brake fluid level and topped up. Test drive confirmed smooth braking.',
    partsReplaced: ['Front brake pads (set)', 'Rear brake pads (set)', 'Brake cleaner spray'],
    totalCost: 14500,
    mileageAtService: 32000,
    techIdx: 3,
  },
  {
    workDone: 'Diagnosed faulty upstream O2 sensor causing check engine light (code P0141). Replaced sensor. Cleared fault codes and performed 20km road test — no recurrence.',
    partsReplaced: ['O2 sensor (upstream)', 'Spark plugs x4', 'Air filter'],
    totalCost: 21000,
    mileageAtService: 95000,
    techIdx: 1,
  },
  {
    workDone: 'Recharged AC system with R134a refrigerant. Replaced expansion valve which was blocked. Fitted new cabin air filter. System now achieving 8°C at vent.',
    partsReplaced: ['R134a refrigerant 500g', 'Expansion valve', 'Cabin air filter'],
    totalCost: 9500,
    mileageAtService: 18000,
    techIdx: 4,
  },
  {
    workDone: 'Inspected front suspension — found worn left lower control arm bushing. Replaced both lower bushings. Aligned steering geometry. Confirmed straight tracking on test drive.',
    partsReplaced: ['Lower control arm bushing (x2)', 'Alignment shims'],
    totalCost: 16800,
    mileageAtService: 8500,
    techIdx: 2,
  },
];

// ─── Reviews (10) ─────────────────────────────────────────────────────────────
// Customers reviewing one of the first 2 workshops (where they had appointments)
const REVIEWS_DATA = [
  { rating: 5, reviewText: 'Excellent service! Team was professional, finished on time, and the car runs perfectly now. Will definitely return.' },
  { rating: 4, reviewText: 'Good quality brake work and fair price. Had to wait a bit longer than expected but overall happy.' },
  { rating: 5, reviewText: 'Very honest diagnosis — they found the exact fault and fixed it at a reasonable cost. No unnecessary work.' },
  { rating: 4, reviewText: 'AC is working great now. Staff explained the problem clearly before proceeding. Clean workshop too.' },
  { rating: 5, reviewText: 'Impressed with the level of detail — they even spotted a worn tyre during the suspension work. Highly recommend.' },
  { rating: 4, reviewText: 'Friendly and knowledgeable. The full service took a full day but the job was thorough.' },
  { rating: 3, reviewText: 'Work was good but the waiting area could be improved. The battery replacement itself was done correctly.' },
  { rating: 5, reviewText: 'Best workshop I have visited. State-of-the-art equipment and the technicians really know their stuff.' },
  { rating: 4, reviewText: 'Quick appointment booking and the alignment was done in 45 minutes. Back to straight tracking.' },
  { rating: 5, reviewText: 'Transparent pricing and no surprises on the invoice. The diagnostics team is very skilled.' },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ══════════════════════════════════════════════════════════════════════════════
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB\n');

  // ── 1. Clear previous seed data ──────────────────────────────────────────────
  console.log('── Clearing previous seed data...');
  const allSubs = [
    ...ADMIN, ...OWNERS, ...TECHNICIANS, ...CUSTOMERS
  ].map(u => u.asgardeoSub);
  const deleted = await User.deleteMany({ asgardeoSub: { $in: allSubs } });
  console.log(`  Removed ${deleted.deletedCount} previous seed users`);

  // ── 2. Insert workshops ───────────────────────────────────────────────────────
  console.log('\n── Inserting 20 workshops...');
  // Remove previous seed workshops by name to avoid duplicates on re-run
  await Workshop.deleteMany({ name: { $in: WORKSHOPS.map(w => w.name) } });
  const workshops = await Workshop.insertMany(WORKSHOPS);
  console.log(`  ✓ ${workshops.length} workshops created`);

  // ── 3. Insert users ───────────────────────────────────────────────────────────
  console.log('\n── Inserting users...');

  const adminUsers = await User.insertMany(ADMIN);

  const ownerUsers = await User.insertMany(
    OWNERS.map((o, i) => ({ ...o, workshopId: workshops[i]._id }))
  );

  const techUsers = await User.insertMany(
    TECHNICIANS.map(t => {
      const { wsIdx, ...rest } = t;
      return { ...rest, workshopId: workshops[wsIdx]._id };
    })
  );

  const customerUsers = await User.insertMany(CUSTOMERS);

  const totalUsers = adminUsers.length + ownerUsers.length + techUsers.length + customerUsers.length;
  console.log(`  ✓ ${totalUsers} users created`);
  console.log(`      Admin: ${adminUsers.length}  |  Owners: ${ownerUsers.length}  |  Technicians: ${techUsers.length}  |  Customers: ${customerUsers.length}`);

  // ── 4. Insert vehicles (2 per customer) ──────────────────────────────────────
  console.log('\n── Inserting 20 vehicles (2 per customer)...');
  await Vehicle.deleteMany({ registrationNo: { $in: [...VEHICLES_PRIMARY, ...VEHICLES_SECONDARY].map(v => v.registrationNo) } });

  const primaryVehicles   = await Vehicle.insertMany(VEHICLES_PRIMARY.map((v, i)   => ({ ...v, ownerId: customerUsers[i]._id })));
  const secondaryVehicles = await Vehicle.insertMany(VEHICLES_SECONDARY.map((v, i) => ({ ...v, ownerId: customerUsers[i]._id })));
  console.log(`  ✓ ${primaryVehicles.length + secondaryVehicles.length} vehicles created`);

  // ── 5. Insert appointments (1 per customer, using primary vehicle) ────────────
  console.log('\n── Inserting 10 appointments...');
  const appointments = await Appointment.insertMany(
    APPOINTMENTS.map((a, i) => {
      const { wsIdx, techIdx, ...rest } = a;
      return {
        ...rest,
        userId:     customerUsers[i]._id,
        vehicleId:  primaryVehicles[i]._id,
        workshopId: workshops[wsIdx]._id,
      };
    })
  );
  console.log(`  ✓ ${appointments.length} appointments created`);

  // ── 6. Insert service records (for in_progress appointments — first 5) ────────
  console.log('\n── Inserting 5 service records...');
  const records = await ServiceRecord.insertMany(
    RECORDS.map((r, i) => {
      const { techIdx, ...rest } = r;
      return {
        ...rest,
        appointmentId:  appointments[i]._id,
        vehicleId:      primaryVehicles[i]._id,
        serviceDate:    appointments[i].scheduledDate,
        technicianName: techUsers[techIdx].fullName,
      };
    })
  );
  console.log(`  ✓ ${records.length} service records created`);

  // ── 7. Insert reviews (one per customer, reviewing the workshop they visited) ──
  console.log('\n── Inserting 10 reviews...');
  // Remove any previous seed reviews to avoid duplicate (workshopId+userId) conflict
  await Review.deleteMany({ userId: { $in: customerUsers.map(c => c._id) } });

  const reviews = await Review.insertMany(
    REVIEWS_DATA.map((rv, i) => ({
      ...rv,
      workshopId:    workshops[APPOINTMENTS[i].wsIdx]._id,
      userId:        customerUsers[i]._id,
      appointmentId: appointments[i]._id,
    }))
  );
  console.log(`  ✓ ${reviews.length} reviews created`);

  // ── 8. Recalculate workshop ratings ──────────────────────────────────────────
  console.log('\n── Recalculating workshop ratings...');
  for (const ws of workshops) {
    const agg = await Review.aggregate([
      { $match: { workshopId: ws._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg.length) {
      await Workshop.findByIdAndUpdate(ws._id, {
        averageRating: Math.round(agg[0].avg * 10) / 10,
        totalReviews:  agg[0].count,
      });
    }
  }
  console.log('  ✓ Ratings updated');

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════');
  console.log('  SEED COMPLETE');
  console.log('════════════════════════════════════════════════');
  console.log(`  Workshops:       ${workshops.length}`);
  console.log(`  Users:           ${totalUsers}`);
  console.log(`    Admin:         ${adminUsers.length}`);
  console.log(`    Owners:        ${ownerUsers.length}`);
  console.log(`    Technicians:   ${techUsers.length}`);
  console.log(`    Customers:     ${customerUsers.length}`);
  console.log(`  Vehicles:        ${primaryVehicles.length + secondaryVehicles.length}  (2 per customer)`);
  console.log(`  Appointments:    ${appointments.length}  (1 vehicle per customer in repair)`);
  console.log(`  Service Records: ${records.length}`);
  console.log(`  Reviews:         ${reviews.length}`);
  console.log('════════════════════════════════════════════════\n');

  console.log('Test accounts (set real Asgardeo passwords separately):');
  console.log('  Admin:     admin@vsrms.lk');
  console.log('  Owner 1:   roshan@autofix.lk      → AutoFix Pro Colombo');
  console.log('  Owner 2:   thilak@lankamotors.lk  → Lanka Motors Kandy');
  console.log('  Tech 1:    kamal@autofix.lk        (AutoFix — 3 techs total)');
  console.log('  Tech 4:    pradeep@lankamotors.lk  (Lanka Motors — 3 techs total)');
  console.log('  Customer:  amara@gmail.com');
  console.log('\nVehicles currently in repair:');
  APPOINTMENTS.filter(a => a.status === 'in_progress').forEach((a, i) => {
    console.log(`  ${VEHICLES_PRIMARY[i].make} ${VEHICLES_PRIMARY[i].model} (${VEHICLES_PRIMARY[i].registrationNo}) → ${a.serviceType} at Workshop ${a.wsIdx}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
