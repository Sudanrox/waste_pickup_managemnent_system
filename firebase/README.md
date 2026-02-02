# KWPM Firebase Configuration

This directory contains Firebase configuration files for the Kathmandu Waste Pickup Management system.

## Files

| File | Purpose |
|------|---------|
| `firebase.json` | Main Firebase configuration |
| `firestore.rules` | Firestore security rules |
| `firestore.indexes.json` | Composite index definitions |
| `.firebaserc` | Project aliases |

## Security Rules Overview

### Role-Based Access Control

The security rules implement RBAC using Firebase Custom Claims:

| Role | Claim | Permissions |
|------|-------|-------------|
| `customer` | `role: "customer"` | Read own ward's notifications, write own responses |
| `admin` | `role: "admin"` | Create notifications, read all responses, manage wards |
| `super_admin` | `role: "super_admin"` | Full access, manage admins, delete records |

### Collection Access Matrix

| Collection | Customer | Admin | Super Admin |
|------------|----------|-------|-------------|
| `/organizations` | Read | Read | Read/Write |
| `/wards` | Read | Read/Write | Full |
| `/customers` | Own only | Read all | Full |
| `/admins` | - | Own only | Full |
| `/notifications` | Own ward | Full | Full |
| `/responses` | Own only | Read all | Full |
| `/fcmTopics` | - | Read | Read |
| `/analytics` | - | Read | Read |
| `/auditLogs` | - | - | Read |

### Key Security Features

1. **Ward-Based Isolation**: Customers can only see notifications for their ward
2. **Response Integrity**: Response IDs enforce `{notificationId}_{customerId}` format
3. **Field Validation**: Ward numbers must be 1-32, names 2-50 chars
4. **Immutable Fields**: Phone numbers, creation timestamps cannot be changed
5. **Default Deny**: All unspecified paths are denied

## Setup Instructions

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Project

```bash
cd firebase
firebase use --add
# Select your Firebase project
```

### 4. Deploy Security Rules

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore
```

### 5. Set Custom Claims (Required)

Use Firebase Admin SDK to set user roles. Example Cloud Function:

```typescript
import * as admin from 'firebase-admin';

// Set customer role after phone auth
export const setCustomerRole = functions.auth.user().onCreate(async (user) => {
  if (user.phoneNumber) {
    await admin.auth().setCustomUserClaims(user.uid, { role: 'customer' });
  }
});

// Callable function to create admin (super_admin only)
export const createAdmin = functions.https.onCall(async (data, context) => {
  // Verify caller is super_admin
  if (context.auth?.token?.role !== 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }

  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, { role });
  return { success: true };
});
```

## Testing Rules Locally

### Using Firebase Emulator

```bash
# Start emulators
firebase emulators:start

# Access Emulator UI at http://localhost:4000
```

### Unit Testing Rules

Create `firestore.rules.test.js`:

```javascript
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

// Test customer can read own ward notifications
it('customer can read notifications for their ward', async () => {
  const db = getFirestore({ uid: 'customer1', role: 'customer' });

  // Setup: customer1 is in ward 5
  await assertSucceeds(
    db.collection('notifications')
      .where('wardNumber', '==', 5)
      .get()
  );
});

// Test customer cannot read other ward notifications
it('customer cannot read other ward notifications', async () => {
  const db = getFirestore({ uid: 'customer1', role: 'customer' });

  // customer1 is in ward 5, trying to read ward 10
  await assertFails(
    db.collection('notifications')
      .where('wardNumber', '==', 10)
      .get()
  );
});
```

Run tests:

```bash
firebase emulators:exec "npm test"
```

## Index Queries

The indexes support these queries:

### Notifications
```javascript
// Get notifications for a ward (customer app)
db.collection('notifications')
  .where('wardNumber', '==', 5)
  .where('scheduledDate', '>=', thirtyDaysAgo)
  .orderBy('scheduledDate', 'desc')

// Get notifications by status (admin dashboard)
db.collection('notifications')
  .where('status', '==', 'sent')
  .orderBy('createdAt', 'desc')
```

### Responses
```javascript
// Get responses for a notification (admin)
db.collection('responses')
  .where('notificationId', '==', 'notif123')
  .orderBy('respondedAt', 'desc')

// Get customer's response history
db.collection('responses')
  .where('customerId', '==', 'customer123')
  .orderBy('respondedAt', 'desc')
```

### Customers
```javascript
// Get customers in a ward (admin)
db.collection('customers')
  .where('wardNumber', '==', 5)
  .orderBy('name', 'asc')
```

## Troubleshooting

### "Missing or insufficient permissions"

1. Check if user has correct custom claim set
2. Verify the user's token has refreshed after claim update
3. Check if querying the correct ward (customers)

### "The query requires an index"

Deploy the indexes:

```bash
firebase deploy --only firestore:indexes
```

Or follow the link in the error message to create manually.

### Testing Custom Claims

```javascript
// Force token refresh to get new claims
await firebase.auth().currentUser.getIdToken(true);

// Check current claims
const token = await firebase.auth().currentUser.getIdTokenResult();
console.log(token.claims.role);
```

## Security Checklist

- [x] All collections have explicit rules
- [x] Default deny rule for unspecified paths
- [x] Customer data isolation by ward
- [x] Response ID format validation
- [x] Field-level write restrictions
- [x] Admin role verification via custom claims
- [x] Audit-ready structure (auditLogs collection)
- [x] No eval() or dynamic field access

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial rules for MVP |
