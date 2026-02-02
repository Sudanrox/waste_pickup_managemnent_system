// Seed script for Firebase Emulators
// Run with: node seed-emulator.js

const http = require('http');

const AUTH_URL = 'http://127.0.0.1:9099';
const FIRESTORE_URL = 'http://127.0.0.1:8080';
const PROJECT_ID = 'demo-project';

// Helper to make HTTP requests
function request(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Create admin user in Auth Emulator
async function createAdminUser() {
  const url = `${AUTH_URL}/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts`;

  const userData = {
    email: 'admin@kwpm.com',
    password: 'admin123',
    displayName: 'Admin User',
    emailVerified: true,
  };

  try {
    const result = await request(url, 'POST', userData);
    console.log('✅ Created admin user: admin@kwpm.com / admin123');
    return result.localId;
  } catch (error) {
    console.log('Admin user might already exist');
    return null;
  }
}

// Add document to Firestore
async function addDocument(collection, docId, data) {
  const url = `${FIRESTORE_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;

  // Convert data to Firestore format
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: String(value) };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    }
  }

  try {
    await request(url, 'PATCH', { fields });
    return true;
  } catch (error) {
    console.error(`Error adding ${collection}/${docId}:`, error.message);
    return false;
  }
}

// Seed wards
async function seedWards() {
  const wardNames = [
    'Budhanilkantha', 'Nagarjun', 'Tarakeshwar', 'Chandragiri', 'Dakshinkali',
    'Kirtipur', 'Shankharapur', 'Tokha', 'Gokarneshwar', 'Kageshwari-Manohara',
    'Tarkeshwar', 'Kapan', 'Baneshwor', 'Shantinagar', 'Gaushala',
    'Battisputali', 'Koteshwor', 'Tinkune', 'New Baneshwor', 'Minbhawan',
    'Baluwatar', 'Maharajgunj', 'Basundhara', 'Samakhusi', 'Gongabu',
    'Swayambhu', 'Kalimati', 'Kalanki', 'Kuleshwor', 'Balkhu',
    'Satdobato', 'Lagankhel'
  ];

  console.log('📍 Seeding 32 wards...');

  for (let i = 1; i <= 32; i++) {
    const wardData = {
      wardNumber: i,
      name: wardNames[i - 1] || `Ward ${i}`,
      nameNe: `वडा ${i}`,
      customerCount: Math.floor(Math.random() * 500) + 50,
      isActive: true,
    };

    await addDocument('wards', `ward_${i}`, wardData);
  }

  console.log('✅ Created 32 wards');
}

// Seed sample notifications
async function seedNotifications() {
  console.log('📢 Seeding sample notifications...');

  const now = new Date();

  const notifications = [
    {
      wardNumber: 1,
      scheduledDate: new Date(now.getTime() + 86400000).toISOString(),
      scheduledTime: '8:00 AM',
      messageText: 'Waste pickup scheduled for Ward 1. Please keep your waste ready.',
      messageTextNe: 'वडा १ को लागि फोहोर संकलन तालिका। कृपया आफ्नो फोहोर तयार राख्नुहोस्।',
      status: 'scheduled',
      createdBy: 'admin',
    },
    {
      wardNumber: 5,
      scheduledDate: now.toISOString(),
      scheduledTime: '9:00 AM',
      messageText: 'Waste pickup in progress for Ward 5.',
      messageTextNe: 'वडा ५ मा फोहोर संकलन भइरहेको छ।',
      status: 'sent',
      createdBy: 'admin',
    },
    {
      wardNumber: 10,
      scheduledDate: new Date(now.getTime() - 86400000).toISOString(),
      scheduledTime: '7:00 AM',
      messageText: 'Waste pickup completed for Ward 10.',
      messageTextNe: 'वडा १० को फोहोर संकलन सम्पन्न।',
      status: 'completed',
      createdBy: 'admin',
    },
  ];

  for (let i = 0; i < notifications.length; i++) {
    await addDocument('notifications', `notif_${i + 1}`, notifications[i]);
  }

  console.log('✅ Created sample notifications');
}

// Main
async function main() {
  console.log('🚀 Seeding Firebase Emulator with demo data...\n');

  await createAdminUser();
  await seedWards();
  await seedNotifications();

  console.log('\n✨ Done! You can now login with:');
  console.log('   Email: admin@kwpm.com');
  console.log('   Password: admin123');
  console.log('\n📊 Emulator UI: http://localhost:4000');
  console.log('🖥️  Admin Dashboard: http://localhost:3000');
}

main().catch(console.error);
