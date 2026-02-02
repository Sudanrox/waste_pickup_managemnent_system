/**
 * KWPM - Seed Data Script
 *
 * This script populates Firestore with initial data:
 * - 32 Wards of Kathmandu
 * - Organization document
 *
 * Usage:
 * 1. Set up Firebase Admin SDK credentials
 * 2. Run: node seed-data.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Option 1: Use service account key file
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Option 2: Use default credentials (when running on GCP)
admin.initializeApp();

const db = admin.firestore();

// Ward data for Kathmandu Metropolitan City
const wardsData = [
  { number: 1, name: "Ward 1 - Thankot", nameNe: "वडा १ - थानकोट" },
  { number: 2, name: "Ward 2 - Nagarjun", nameNe: "वडा २ - नागार्जुन" },
  { number: 3, name: "Ward 3 - Goldhunga", nameNe: "वडा ३ - गोल्ढुंगा" },
  { number: 4, name: "Ward 4 - Ranipauwa", nameNe: "वडा ४ - रानीपौवा" },
  { number: 5, name: "Ward 5 - Swayambhu", nameNe: "वडा ५ - स्वयम्भू" },
  { number: 6, name: "Ward 6 - Chhetrapati", nameNe: "वडा ६ - छेत्रपाटी" },
  { number: 7, name: "Ward 7 - Maru", nameNe: "वडा ७ - मारू" },
  { number: 8, name: "Ward 8 - Kantipath", nameNe: "वडा ८ - कान्तिपथ" },
  { number: 9, name: "Ward 9 - Lazimpat", nameNe: "वडा ९ - लाजिम्पाट" },
  { number: 10, name: "Ward 10 - Maharajgunj", nameNe: "वडा १० - महाराजगंज" },
  { number: 11, name: "Ward 11 - Budhanilkantha", nameNe: "वडा ११ - बूढानीलकण्ठ" },
  { number: 12, name: "Ward 12 - Tokha", nameNe: "वडा १२ - टोखा" },
  { number: 13, name: "Ward 13 - Gongabu", nameNe: "वडा १३ - गोंगबू" },
  { number: 14, name: "Ward 14 - Samakhusi", nameNe: "वडा १४ - सामाखुसी" },
  { number: 15, name: "Ward 15 - Balaju", nameNe: "वडा १५ - बालाजू" },
  { number: 16, name: "Ward 16 - Teku", nameNe: "वडा १६ - टेकू" },
  { number: 17, name: "Ward 17 - Kalimati", nameNe: "वडा १७ - कालीमाटी" },
  { number: 18, name: "Ward 18 - Kalanki", nameNe: "वडा १८ - कलंकी" },
  { number: 19, name: "Ward 19 - Kirtipur", nameNe: "वडा १९ - कीर्तिपुर" },
  { number: 20, name: "Ward 20 - Panga", nameNe: "वडा २० - पंगा" },
  { number: 21, name: "Ward 21 - Sitapaila", nameNe: "वडा २१ - सीतापाइला" },
  { number: 22, name: "Ward 22 - Kuleshwor", nameNe: "वडा २२ - कुलेश्वर" },
  { number: 23, name: "Ward 23 - Bagbazar", nameNe: "वडा २३ - बागबजार" },
  { number: 24, name: "Ward 24 - Kamalpokhari", nameNe: "वडा २४ - कमलपोखरी" },
  { number: 25, name: "Ward 25 - Putalisadak", nameNe: "वडा २५ - पुतलीसडक" },
  { number: 26, name: "Ward 26 - Baneshwor", nameNe: "वडा २६ - बानेश्वर" },
  { number: 27, name: "Ward 27 - Minbhawan", nameNe: "वडा २७ - मीनभवन" },
  { number: 28, name: "Ward 28 - Naxal", nameNe: "वडा २८ - नक्साल" },
  { number: 29, name: "Ward 29 - Battisputali", nameNe: "वडा २९ - बत्तीसपुतली" },
  { number: 30, name: "Ward 30 - Gaushala", nameNe: "वडा ३० - गौशाला" },
  { number: 31, name: "Ward 31 - Sinamangal", nameNe: "वडा ३१ - सिनामंगल" },
  { number: 32, name: "Ward 32 - Koteshwor", nameNe: "वडा ३२ - कोटेश्वर" },
];

async function seedOrganization() {
  console.log('Seeding organization...');

  const orgRef = db.collection('organizations').doc('kwpm');
  await orgRef.set({
    name: 'KWPM',
    fullName: 'Kathmandu Waste Pickup Management',
    description: 'Ward-based waste pickup notification system for Kathmandu Metropolitan City',
    tagline: 'Since 2026',
    contactEmail: 'info@kwpm.gov.np',
    contactPhone: '+977-1-4211234',
    address: 'Kathmandu Metropolitan City Office',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: {
      defaultLanguage: 'ne',
      supportedLanguages: ['en', 'ne'],
      maxWards: 32,
      timezone: 'Asia/Kathmandu'
    }
  });

  console.log('✓ Organization seeded');
}

async function seedWards() {
  console.log('Seeding wards...');

  const batch = db.batch();

  for (const ward of wardsData) {
    const wardRef = db.collection('wards').doc(`ward_${ward.number}`);
    batch.set(wardRef, {
      wardNumber: ward.number,
      name: ward.name,
      nameNe: ward.nameNe,
      customerCount: 0,
      isActive: true
    });
  }

  await batch.commit();
  console.log(`✓ ${wardsData.length} wards seeded`);
}

async function createSuperAdmin(email, uid) {
  console.log(`Creating super admin: ${email}...`);

  // Set custom claims
  await admin.auth().setCustomUserClaims(uid, { role: 'super_admin' });

  // Create admin document
  await db.collection('admins').doc(uid).set({
    email: email,
    name: 'Super Admin',
    role: 'super_admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true
  });

  console.log('✓ Super admin created');
  console.log('  IMPORTANT: User must sign out and sign in again for claims to take effect');
}

async function main() {
  try {
    console.log('\n🌱 KWPM Seed Data Script\n');

    await seedOrganization();
    await seedWards();

    // Uncomment to create super admin:
    // await createSuperAdmin('admin@kwpm.gov.np', 'FIREBASE_USER_UID_HERE');

    console.log('\n✅ Seeding complete!\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

main();
