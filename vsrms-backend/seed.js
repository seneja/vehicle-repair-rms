'use strict';

/**
 * VSRMS MongoDB Seed Script
 * Usage: node seed.js
 *
 * Seeds 10 relational entries across all collections.
 * WARNING: This will DROP existing seed data (documents with seedData:true).
 * Run only in development / staging.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ── Models ─────────────────────────────────────────────────────────────────────
const User          = require('./src/models/User');
const Workshop      = require('./src/models/Workshop');
const Vehicle       = require('./src/models/Vehicle');
const Appointment   = require('./src/models/Appointment');
const ServiceRecord = require('./src/models/ServiceRecord');
const Review        = require('./src/models/Review');

// ── Helpers ────────────────────────────────────────────────────────────────────
const days = (n) => new Date(Date.now() + n * 86400_000);
const pastDays = (n) => new Date(Date.now() - n * 86400_000);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Workshops (3) ───────────────────────────────────────────────────────────
  const workshopsData = [
    {
      name: 'AutoFix Pro Colombo',
      location: { type: 'Point', coordinates: [79.8612, 6.9271] },
      address: '12 Galle Road, Colombo 03',
      district: 'Colombo',
      servicesOffered: ['Engine Repair', 'Brake Service', 'Oil Change', 'Tire Rotation', 'AC Repair'],
      description: 'Premier auto repair workshop in Colombo with over 15 years of experience. Specializing in Japanese and European vehicles.',
      contactNumber: '+94 11 234 5678',
      averageRating: 4.4,
      totalReviews: 3,
    },
    {
      name: 'Lanka Motors Kandy',
      location: { type: 'Point', coordinates: [80.6337, 7.2906] },
      address: '88 Peradeniya Road, Kandy',
      district: 'Kandy',
      servicesOffered: ['Full Service', 'Transmission Repair', 'Electrical Diagnostics', 'Body Work', 'Wheel Alignment'],
      description: 'Family-owned workshop in Kandy providing reliable and affordable vehicle maintenance since 1998.',
      contactNumber: '+94 81 222 3344',
      averageRating: 4.7,
      totalReviews: 4,
    },
    {
      name: 'Precision Garage Galle',
      location: { type: 'Point', coordinates: [80.2170, 6.0329] },
      address: '34 Main Street, Galle Fort',
      district: 'Galle',
      servicesOffered: ['Suspension Repair', 'Engine Diagnostics', 'Air Conditioning', 'Battery Service', 'Detailing'],
      description: 'Modern facility in Galle equipped with latest diagnostic tools for all vehicle makes and models.',
      contactNumber: '+94 91 333 4455',
      averageRating: 4.2,
      totalReviews: 3,
    },
  ];

  // ── Users (17 total) ────────────────────────────────────────────────────────
  // 1 admin, 3 owners, 3 staff, 10 customers
  // asgardeoSub must be unique — use fake subs for seed data
  const usersData = {
    admin: [
      { asgardeoSub: 'seed-admin-001', fullName: 'Admin Nimal', email: 'admin@vsrms.lk', role: 'admin', active: true },
    ],
    owners: [
      { asgardeoSub: 'seed-owner-001', fullName: 'Roshan Fernando', email: 'roshan@autofix.lk',   role: 'workshop_owner', active: true },
      { asgardeoSub: 'seed-owner-002', fullName: 'Thilak Bandara',  email: 'thilak@lankamotors.lk', role: 'workshop_owner', active: true },
      { asgardeoSub: 'seed-owner-003', fullName: 'Sunil Perera',    email: 'sunil@precision.lk',  role: 'workshop_owner', active: true },
    ],
    staff: [
      { asgardeoSub: 'seed-staff-001', fullName: 'Kamal Silva',    email: 'kamal.tech@autofix.lk',    role: 'workshop_staff', active: true },
      { asgardeoSub: 'seed-staff-002', fullName: 'Pradeep Kumara', email: 'pradeep.tech@lankamotors.lk', role: 'workshop_staff', active: true },
      { asgardeoSub: 'seed-staff-003', fullName: 'Janith Wijesinghe', email: 'janith.tech@precision.lk', role: 'workshop_staff', active: true },
    ],
    customers: [
      { asgardeoSub: 'seed-cust-001', fullName: 'Amara Jayawardena', email: 'amara@gmail.com',   role: 'customer', phone: '+94 77 111 2233', active: true },
      { asgardeoSub: 'seed-cust-002', fullName: 'Ishara Pathirana',  email: 'ishara@gmail.com',  role: 'customer', phone: '+94 71 222 3344', active: true },
      { asgardeoSub: 'seed-cust-003', fullName: 'Dinesh Samarasinghe', email: 'dinesh@gmail.com', role: 'customer', phone: '+94 76 333 4455', active: true },
      { asgardeoSub: 'seed-cust-004', fullName: 'Nalini Wickramaratne', email: 'nalini@gmail.com', role: 'customer', phone: '+94 78 444 5566', active: true },
      { asgardeoSub: 'seed-cust-005', fullName: 'Chamara Dissanayake', email: 'chamara@gmail.com', role: 'customer', phone: '+94 72 555 6677', active: true },
      { asgardeoSub: 'seed-cust-006', fullName: 'Sanduni Mendis',    email: 'sanduni@gmail.com', role: 'customer', phone: '+94 75 666 7788', active: true },
      { asgardeoSub: 'seed-cust-007', fullName: 'Ruwan Gunasekara',  email: 'ruwan@gmail.com',   role: 'customer', phone: '+94 70 777 8899', active: true },
      { asgardeoSub: 'seed-cust-008', fullName: 'Tharanga Rajapaksha', email: 'tharanga@gmail.com', role: 'customer', phone: '+94 77 888 9900', active: true },
      { asgardeoSub: 'seed-cust-009', fullName: 'Manjula Senanayake', email: 'manjula@gmail.com', role: 'customer', phone: '+94 71 999 0011', active: true },
      { asgardeoSub: 'seed-cust-010', fullName: 'Prasad Liyanage',  email: 'prasad@gmail.com',  role: 'customer', phone: '+94 76 000 1122', active: true },
    ],
  };

  // ── Vehicles (10) ──────────────────────────────────────────────────────────
  const vehiclesData = [
    { registrationNo: 'WP-CAR-1234', make: 'Toyota', model: 'Corolla', year: 2019, vehicleType: 'car', mileage: 48500 },
    { registrationNo: 'WP-CAR-5678', make: 'Honda',  model: 'Civic',   year: 2020, vehicleType: 'car', mileage: 32000 },
    { registrationNo: 'CP-VAN-4321', make: 'Toyota', model: 'Hiace',   year: 2017, vehicleType: 'van', mileage: 95000 },
    { registrationNo: 'SP-CAR-8765', make: 'Suzuki', model: 'Swift',   year: 2021, vehicleType: 'car', mileage: 18000 },
    { registrationNo: 'WP-MOT-1111', make: 'Honda',  model: 'CB150R',  year: 2022, vehicleType: 'motorcycle', mileage: 8500 },
    { registrationNo: 'NW-CAR-2222', make: 'Nissan', model: 'Sunny',   year: 2018, vehicleType: 'car', mileage: 61000 },
    { registrationNo: 'SG-TUK-3333', make: 'Bajaj',  model: 'RE',      year: 2020, vehicleType: 'tuk', mileage: 44000 },
    { registrationNo: 'WP-CAR-4444', make: 'Mazda',  model: 'Demio',   year: 2019, vehicleType: 'car', mileage: 37500 },
    { registrationNo: 'CP-CAR-5555', make: 'Mitsubishi', model: 'Lancer', year: 2016, vehicleType: 'car', mileage: 82000 },
    { registrationNo: 'EP-VAN-6666', make: 'Suzuki', model: 'Every',   year: 2021, vehicleType: 'van', mileage: 22000 },
  ];

  // ── Appointments (10) ──────────────────────────────────────────────────────
  const appointmentsData = [
    { serviceType: 'Oil Change',            status: 'completed',   scheduledDate: pastDays(30), notes: 'Full synthetic oil requested' },
    { serviceType: 'Brake Service',         status: 'completed',   scheduledDate: pastDays(20), notes: 'Front and rear brakes' },
    { serviceType: 'Engine Diagnostics',    status: 'completed',   scheduledDate: pastDays(15), notes: 'Check engine light on' },
    { serviceType: 'AC Repair',             status: 'completed',   scheduledDate: pastDays(10), notes: 'AC not cooling properly' },
    { serviceType: 'Tire Rotation',         status: 'in_progress', scheduledDate: days(0),      notes: 'All 4 tires' },
    { serviceType: 'Full Service',          status: 'in_progress', scheduledDate: days(0),      notes: '60,000 km major service' },
    { serviceType: 'Wheel Alignment',       status: 'confirmed',   scheduledDate: days(2),      notes: 'Vehicle pulling to the left' },
    { serviceType: 'Battery Replacement',   status: 'confirmed',   scheduledDate: days(3),      notes: 'Battery not holding charge' },
    { serviceType: 'Suspension Inspection', status: 'pending',     scheduledDate: days(5),      notes: 'Bumpy ride over small roads' },
    { serviceType: 'Electrical Diagnostics', status: 'pending',    scheduledDate: days(7),      notes: 'Dashboard warning lights' },
  ];

  // ── Service Records (8 — only for completed/in_progress appointments) ──────
  const recordsData = [
    { workDone: 'Replaced engine oil with 5W-30 synthetic, new oil filter installed', partsReplaced: ['Oil filter', 'Drain plug washer'], totalCost: 4500, mileageAtService: 48000 },
    { workDone: 'Replaced front brake pads and resurfaced rotors, rear brake shoes inspected', partsReplaced: ['Front brake pads (x4)', 'Brake cleaner'], totalCost: 12500, mileageAtService: 32000 },
    { workDone: 'Diagnosed faulty O2 sensor causing CEL. Replaced sensor and cleared codes', partsReplaced: ['O2 sensor (upstream)', 'Spark plugs (x4)'], totalCost: 18000, mileageAtService: 95000 },
    { workDone: 'Recharged AC refrigerant (R134a), replaced cabin air filter and AC filter', partsReplaced: ['R134a refrigerant', 'Cabin air filter'], totalCost: 8500, mileageAtService: 18000 },
    { workDone: 'Rotated all 4 tires in X-pattern, checked tread depth and inflation', partsReplaced: [], totalCost: 1500, mileageAtService: 8500 },
    { workDone: '60,000 km major service: oil, filters, spark plugs, timing belt inspection, brake fluid flush', partsReplaced: ['Oil filter', 'Air filter', 'Fuel filter', 'Spark plugs (x4)', 'Brake fluid'], totalCost: 32000, mileageAtService: 61000 },
  ];

  // ── Reviews (10 — customers reviewing workshops) ───────────────────────────
  const reviewsData = [
    { rating: 5, reviewText: 'Excellent service! The team was professional and finished on time. Highly recommend.' },
    { rating: 4, reviewText: 'Good workshop, quick turnaround on the brake job. Will come back.' },
    { rating: 5, reviewText: 'Very honest pricing and great work. My Corolla runs perfectly now.' },
    { rating: 4, reviewText: 'Knowledgeable staff, they explained everything clearly. Satisfied customer.' },
    { rating: 5, reviewText: 'Best workshop in Kandy! They found the issue my previous mechanic missed.' },
    { rating: 4, reviewText: 'Clean facility, friendly staff, reasonable prices. 4 stars from me.' },
    { rating: 5, reviewText: 'Amazing service experience. They even washed my car before returning it!' },
    { rating: 3, reviewText: 'Decent work but had to wait longer than expected. Good quality though.' },
    { rating: 4, reviewText: 'Reliable and trustworthy. I always bring my vehicles here for service.' },
    { rating: 5, reviewText: 'Top-notch diagnostics equipment and skilled technicians. Very impressed.' },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // INSERT DATA
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n── Clearing previous seed data...');
  // Remove by unique identifiers to avoid duplicates on re-run
  const seedSubs = [
    ...usersData.admin, ...usersData.owners, ...usersData.staff, ...usersData.customers
  ].map(u => u.asgardeoSub);
  await User.deleteMany({ asgardeoSub: { $in: seedSubs } });
  console.log('  Cleared seed users');

  // ── Insert Workshops ────────────────────────────────────────────────────────
  console.log('\n── Inserting workshops...');
  const workshops = await Workshop.insertMany(workshopsData);
  console.log(`  Created ${workshops.length} workshops`);

  // ── Insert Users ────────────────────────────────────────────────────────────
  console.log('\n── Inserting users...');

  const adminUsers  = await User.insertMany(usersData.admin);
  const ownerUsers  = await User.insertMany(
    usersData.owners.map((o, i) => ({ ...o, workshopId: workshops[i]._id }))
  );
  const staffUsers  = await User.insertMany(
    usersData.staff.map((s, i) => ({ ...s, workshopId: workshops[i]._id }))
  );
  const customerUsers = await User.insertMany(usersData.customers);
  console.log(`  Created ${adminUsers.length + ownerUsers.length + staffUsers.length + customerUsers.length} users`);

  // ── Insert Vehicles ─────────────────────────────────────────────────────────
  console.log('\n── Inserting vehicles...');
  const vehicles = await Vehicle.insertMany(
    vehiclesData.map((v, i) => ({ ...v, ownerId: customerUsers[i]._id }))
  );
  console.log(`  Created ${vehicles.length} vehicles`);

  // ── Insert Appointments (cycling through workshops and vehicles) ────────────
  console.log('\n── Inserting appointments...');
  const workshopCycle = [0, 0, 1, 1, 0, 1, 2, 2, 0, 1]; // which workshop index per appointment
  const appointments = await Appointment.insertMany(
    appointmentsData.map((a, i) => ({
      ...a,
      userId:     customerUsers[i]._id,
      vehicleId:  vehicles[i]._id,
      workshopId: workshops[workshopCycle[i]]._id,
    }))
  );
  console.log(`  Created ${appointments.length} appointments`);

  // ── Insert Service Records (for first 6 appointments — completed/in_progress) ─
  console.log('\n── Inserting service records...');
  const techCycle = [0, 1, 0, 2, 1, 0]; // staff index for tech name
  const records = await ServiceRecord.insertMany(
    recordsData.map((r, i) => ({
      ...r,
      appointmentId:  appointments[i]._id,
      vehicleId:      vehicles[i]._id,
      serviceDate:    appointments[i].scheduledDate,
      technicianName: staffUsers[techCycle[i]].fullName,
    }))
  );
  console.log(`  Created ${records.length} service records`);

  // ── Insert Reviews (customers reviewing workshops for completed appointments) ─
  console.log('\n── Inserting reviews...');
  // Only insert reviews for customers who have completed appointments
  // Use unique (workshopId, userId) pairs
  const reviewInserts = reviewsData.map((rv, i) => {
    const apptIdx  = i % 4; // first 4 are completed
    const custIdx  = i;
    const wsIdx    = workshopCycle[apptIdx];
    return {
      ...rv,
      workshopId:    workshops[wsIdx % 3]._id,
      userId:        customerUsers[custIdx]._id,
      appointmentId: appointments[apptIdx]._id,
    };
  });

  // De-duplicate (workshopId+userId) in seed data before insert
  const seen = new Set();
  const uniqueReviews = reviewInserts.filter(r => {
    const key = `${r.workshopId}-${r.userId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const reviews = await Review.insertMany(uniqueReviews);
  console.log(`  Created ${reviews.length} reviews`);

  // ── Update Workshop avgRating based on seed reviews ─────────────────────────
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
  console.log('  Workshop ratings updated');

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('SEED COMPLETE');
  console.log('══════════════════════════════════════════════');
  console.log(`Workshops:       ${workshops.length}`);
  console.log(`Users (total):   ${adminUsers.length + ownerUsers.length + staffUsers.length + customerUsers.length}`);
  console.log(`  Admin:         ${adminUsers.length}`);
  console.log(`  Owners:        ${ownerUsers.length}`);
  console.log(`  Technicians:   ${staffUsers.length}`);
  console.log(`  Customers:     ${customerUsers.length}`);
  console.log(`Vehicles:        ${vehicles.length}`);
  console.log(`Appointments:    ${appointments.length}`);
  console.log(`Service Records: ${records.length}`);
  console.log(`Reviews:         ${reviews.length}`);
  console.log('══════════════════════════════════════════════\n');
  console.log('Test accounts (use Asgardeo to set actual passwords):');
  console.log('  Admin:   admin@vsrms.lk');
  console.log('  Owner 1: roshan@autofix.lk   → Workshop: AutoFix Pro Colombo');
  console.log('  Owner 2: thilak@lankamotors.lk → Workshop: Lanka Motors Kandy');
  console.log('  Staff 1: kamal.tech@autofix.lk');
  console.log('  Customer: amara@gmail.com');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
