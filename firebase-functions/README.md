# KWPM Cloud Functions

Firebase Cloud Functions for Kathmandu Waste Pickup Management system.

## Functions Overview

### Auth Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `onCustomerCreate` | Auth onCreate | Sets customer role when user registers via phone |
| `setAdminRole` | Callable | Creates/updates admin accounts (super_admin only) |

### Notification Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `onNotificationCreate` | Firestore onCreate | Sends FCM push to ward topic when notification created |
| `onNotificationUpdate` | Firestore onUpdate | Handles cancellation and reschedule pushes |
| `onResponseWrite` | Firestore onWrite | Updates response stats (yesCount, noCount) |

### Customer Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `onCustomerWardChange` | Firestore onUpdate | Updates FCM topic subscriptions when ward changes |
| `updateFcmToken` | Callable | Updates customer's FCM token and subscribes to ward topic |

### Admin Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `createNotification` | Callable | Creates new pickup notification |
| `reschedulePickup` | Callable | Reschedules a pickup (cancels old, creates new) |
| `getWardStats` | Callable | Returns ward statistics for dashboard |

## Setup

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (required for Cloud Functions)

### Installation

```bash
cd firebase-functions
npm install
```

### Configuration

1. Login to Firebase:
```bash
firebase login
```

2. Select project:
```bash
firebase use <your-project-id>
```

3. Set region (optional - default is asia-south1):
```bash
firebase functions:config:set region=asia-south1
```

### Build

```bash
npm run build
```

### Deploy

```bash
# Deploy all functions
npm run deploy

# Or deploy specific function
firebase deploy --only functions:onNotificationCreate
```

### Local Development

```bash
# Start emulators
npm run serve

# Or use Firebase emulator suite
firebase emulators:start
```

## Function Details

### onNotificationCreate

Triggered when a new document is created in `/notifications/{notificationId}`.

**Actions:**
1. Validates notification status is "scheduled"
2. Constructs FCM message with localization support
3. Sends to FCM topic `ward_{wardNumber}`
4. Updates notification status to "sent"
5. Records `sentAt` timestamp and `fcmMessageId`

**FCM Payload:**
```json
{
  "notification": {
    "title": "Waste Pickup Scheduled",
    "body": "Pickup for Ward 5 on Feb 1, 2026 at 9:00 AM"
  },
  "data": {
    "notificationId": "abc123",
    "wardNumber": "5",
    "scheduledDate": "2026-02-01T00:00:00.000Z",
    "scheduledTime": "9:00 AM",
    "type": "pickup_scheduled"
  }
}
```

### onResponseWrite

Triggered when a document is created/updated/deleted in `/responses/{responseId}`.

**Actions:**
1. On create: Increments yesCount or noCount
2. On update (response changed): Decrements old, increments new
3. On delete: Decrements the appropriate counter
4. Uses Firestore transactions for atomicity

### createNotification (Callable)

**Request:**
```typescript
{
  wardNumber: number;        // 1-32
  scheduledDate: string;     // ISO date "2026-02-01"
  scheduledTime: string;     // "9:00 AM"
  messageText: string;       // English message
  messageTextNe?: string;    // Nepali message (optional)
}
```

**Response:**
```typescript
{
  success: boolean;
  notificationId: string;
  wardNumber: number;
  customerCount: number;
}
```

### reschedulePickup (Callable)

**Request:**
```typescript
{
  originalNotificationId: string;
  newScheduledDate: string;
  newScheduledTime: string;
  messageText?: string;
  messageTextNe?: string;
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  originalNotificationId: string;
  newNotificationId: string;
  wardNumber: number;
}
```

### getWardStats (Callable)

**Request:**
```typescript
{
  wardNumber?: number;  // Optional - specific ward or all
}
```

**Response (single ward):**
```typescript
{
  success: boolean;
  data: {
    wardNumber: number;
    wardId: string;
    name: string;
    nameNe: string;
    customerCount: number;
    recentNotifications: number;
    averageResponseRate: number;
    lastPickupDate: string | null;
  }
}
```

## Error Handling

All functions use standard Firebase error codes:

| Code | Description |
|------|-------------|
| `unauthenticated` | User not logged in |
| `permission-denied` | User lacks required role |
| `invalid-argument` | Invalid or missing parameters |
| `not-found` | Resource not found |
| `internal` | Server error |

## Logging

All functions log to Firebase Functions console:

```bash
# View logs
firebase functions:log

# View logs for specific function
firebase functions:log --only onNotificationCreate

# Stream logs
firebase functions:log --follow
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Testing

Use Firebase Emulator Suite:

```bash
firebase emulators:start

# Access emulator UI at http://localhost:4000
```

### Test Callable Functions

```javascript
// From client SDK
const createNotification = firebase.functions().httpsCallable('createNotification');
const result = await createNotification({
  wardNumber: 5,
  scheduledDate: '2026-02-15',
  scheduledTime: '9:00 AM',
  messageText: 'Test pickup notification'
});
console.log(result.data);
```

## Security

- All callable functions verify authentication
- Admin functions verify `role` custom claim
- Firestore triggers operate with admin privileges
- Sensitive operations are logged to audit trail

## Region

All functions are deployed to `asia-south1` (Mumbai) for lowest latency to Nepal.

To change region, update the `.region()` call in each function:

```typescript
functions.region("asia-south1")
```
