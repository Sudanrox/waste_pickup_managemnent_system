const admin = require('firebase-admin');

// Initialize with emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
  projectId: 'kwpm-waste-pickup'
});

async function setAdminClaims() {
  const uid = 'rPs3yp6Zmfch4WYOYLmmCMflOxTu';

  try {
    await admin.auth().setCustomUserClaims(uid, { role: 'super_admin' });
    console.log('Custom claims set successfully!');

    // Verify
    const user = await admin.auth().getUser(uid);
    console.log('User claims:', user.customClaims);
  } catch (error) {
    console.error('Error:', error.message);
  }

  process.exit(0);
}

setAdminClaims();
