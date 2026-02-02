# Kathmandu Waste Pickup Management (KWPM)
## Complete System Design Document

> **Branding Update**: The project is now branded as **KWPM** (Kathmandu Waste Pickup Management) with a blue-to-green gradient theme featuring the Boudhanath Stupa silhouette.

---

## 1. Assumptions

### Business Assumptions
- **Single Organization**: KWBPN operates as a single municipal waste management organization for Kathmandu
- **Ward System**: Kathmandu has 32 wards (Ward 1-32), each with distinct boundaries
- **One Ward Per Customer**: A customer belongs to exactly one ward at a time
- **Admin Team**: Small team of 2-5 admins managing the system
- **Pickup Frequency**: Typically 1-3 pickups per ward per week

### Technical Assumptions
- **Internet Connectivity**: Customers have intermittent internet; offline support is critical
- **Device Distribution**: Target iOS 15+ (covers ~95% of active iPhones in Nepal)
- **Phone Numbers**: All customers have Nepali phone numbers (+977)
- **Language**: Primary Nepali, secondary English (i18n from day one)
- **Scale**: MVP targets 1,000-10,000 customers initially

### Why Phone OTP Authentication?
1. **Universal Access**: Every customer has a phone number; not everyone has email
2. **Verification**: Phone numbers are tied to identity in Nepal (requires citizenship to get SIM)
3. **Familiarity**: Nepali users are accustomed to OTP (banking apps, eSewa, Khalti)
4. **No Password Fatigue**: Users don't need to remember passwords
5. **Delivery Reliability**: SMS delivery in Nepal is reliable via Firebase
6. **Fraud Prevention**: Harder to create fake accounts vs email

---

## 2. User Stories

### Customer User Stories

| ID | Story | Priority |
|----|-------|----------|
| C1 | As a customer, I can register using my phone number so I can access the app | P0 |
| C2 | As a customer, I can set my ward number during onboarding so I receive relevant notifications | P0 |
| C3 | As a customer, I can view pickup notifications for my ward so I know when pickup is scheduled | P0 |
| C4 | As a customer, I can respond YES/NO to a pickup notification so the admin knows my availability | P0 |
| C5 | As a customer, I can see my response status so I know if I've already responded | P0 |
| C6 | As a customer, I receive push notifications when a new pickup is scheduled for my ward | P0 |
| C7 | As a customer, I can view notifications offline so I have access even without internet | P1 |
| C8 | As a customer, I can update my profile (name, ward) so my information stays current | P1 |
| C9 | As a customer, I can see notification history so I can track past pickups | P2 |
| C10 | As a customer, I can switch between Nepali and English so I can use my preferred language | P2 |

### Admin User Stories

| ID | Story | Priority |
|----|-------|----------|
| A1 | As an admin, I can log in securely so I can access the dashboard | P0 |
| A2 | As an admin, I can create a pickup notification for a specific ward | P0 |
| A3 | As an admin, I can send push notifications to all customers in a ward | P0 |
| A4 | As an admin, I can view all responses for a notification | P0 |
| A5 | As an admin, I can see response statistics (YES/NO/No Response counts) | P0 |
| A6 | As an admin, I can reschedule a pickup if many customers respond NO | P1 |
| A7 | As an admin, I can view list of all wards | P1 |
| A8 | As an admin, I can view customer list per ward | P2 |
| A9 | As an admin, I can export response data for reporting | P2 |

---

## 3. Screen List + Navigation

### iOS Customer App Screens

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP NAVIGATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAUNCH                                                          │
│    │                                                             │
│    ▼                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   Splash    │───▶│  Onboarding │───▶│  Phone OTP  │          │
│  │   Screen    │    │   Welcome   │    │   Screen    │          │
│  └─────────────┘    └─────────────┘    └──────┬──────┘          │
│                                               │                  │
│                                               ▼                  │
│                                        ┌─────────────┐          │
│                                        │   Profile   │          │
│                                        │   Setup     │          │
│                                        └──────┬──────┘          │
│                                               │                  │
│    ┌──────────────────────────────────────────┘                  │
│    │                                                             │
│    ▼                                                             │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                    TAB BAR                          │        │
│  ├─────────────┬─────────────┬─────────────────────────┤        │
│  │    Home     │   History   │       Profile           │        │
│  │    Tab      │    Tab      │        Tab              │        │
│  └──────┬──────┴──────┬──────┴───────────┬─────────────┘        │
│         │             │                   │                      │
│         ▼             ▼                   ▼                      │
│  ┌─────────────┐ ┌─────────────┐  ┌─────────────┐               │
│  │    Home     │ │  Notification│  │   Profile   │               │
│  │   Screen    │ │   History   │  │   Screen    │               │
│  │             │ │   Screen    │  │             │               │
│  │ - Latest    │ │             │  │ - Name      │               │
│  │   Notif     │ │ - Past      │  │ - Phone     │               │
│  │ - YES/NO    │ │   pickups   │  │ - Ward      │               │
│  │   Buttons   │ │ - Responses │  │ - Language  │               │
│  │ - Status    │ │             │  │ - Logout    │               │
│  └──────┬──────┘ └─────────────┘  └─────────────┘               │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Notification│                                                │
│  │   Detail    │                                                │
│  │   Screen    │                                                │
│  │             │                                                │
│  │ - Full msg  │                                                │
│  │ - YES/NO    │                                                │
│  │ - Timestamp │                                                │
│  └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Screen Descriptions

| Screen | Purpose | Key Components |
|--------|---------|----------------|
| **SplashScreen** | App launch, auth check | Logo, loading indicator |
| **OnboardingWelcome** | Introduction to app | Carousel/single welcome, "Get Started" button |
| **PhoneOTPScreen** | Phone authentication | Phone input, OTP input, verify button |
| **ProfileSetupScreen** | Initial profile creation | Name input, ward picker, save button |
| **HomeScreen** | Main dashboard | Latest notification card, YES/NO buttons, status |
| **NotificationDetailScreen** | Full notification view | Message, date/time, ward, YES/NO, response time |
| **HistoryScreen** | Past notifications | List of notifications with response status |
| **ProfileScreen** | User settings | Edit name, change ward, language toggle, logout |

### Admin Web Dashboard Screens

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │   Login     │                                                │
│  │   Page      │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                 SIDEBAR NAVIGATION                   │        │
│  ├─────────────┬─────────────┬─────────────┬───────────┤        │
│  │  Dashboard  │    Wards    │Notifications│  Settings │        │
│  └──────┬──────┴──────┬──────┴──────┬──────┴─────┬─────┘        │
│         │             │             │            │               │
│         ▼             ▼             ▼            ▼               │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │ Dashboard │ │   Ward    │ │  Create   │ │  Admin    │        │
│  │  Overview │ │   List    │ │  Notif    │ │  Settings │        │
│  │           │ │           │ │  Form     │ │           │        │
│  │ - Stats   │ │ - All 32  │ │           │ │ - Profile │        │
│  │ - Recent  │ │   wards   │ │ - Ward    │ │ - Password│        │
│  │   notifs  │ │ - Customer│ │   select  │ │           │        │
│  │ - Charts  │ │   counts  │ │ - Date    │ └───────────┘        │
│  └───────────┘ └───────────┘ │ - Time    │                      │
│                              │ - Message │                      │
│                              │ - Send    │                      │
│                              └─────┬─────┘                      │
│                                    │                            │
│                                    ▼                            │
│                             ┌───────────┐                       │
│                             │ Notif     │                       │
│                             │ Detail    │                       │
│                             │           │                       │
│                             │ - Stats   │                       │
│                             │ - Response│                       │
│                             │   list    │                       │
│                             │ - Resched │                       │
│                             └───────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Model

### Firestore Collection Structure

```
firestore-root/
├── organizations/
│   └── {orgId}/                    # "kwbpn" for this app
│       ├── name: string
│       ├── createdAt: timestamp
│       └── settings: map
│
├── wards/
│   └── {wardId}/                   # "ward_1", "ward_2", etc.
│       ├── wardNumber: number
│       ├── name: string
│       ├── nameNe: string          # Nepali name
│       ├── customerCount: number   # Denormalized counter
│       └── isActive: boolean
│
├── customers/
│   └── {customerId}/               # Same as Firebase Auth UID
│       ├── phoneNumber: string
│       ├── name: string
│       ├── wardId: string
│       ├── wardNumber: number      # Denormalized for queries
│       ├── fcmToken: string
│       ├── language: string        # "en" or "ne"
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── isActive: boolean
│
├── admins/
│   └── {adminId}/                  # Same as Firebase Auth UID
│       ├── email: string
│       ├── name: string
│       ├── role: string            # "super_admin" or "admin"
│       ├── createdAt: timestamp
│       └── isActive: boolean
│
├── notifications/
│   └── {notificationId}/           # Auto-generated
│       ├── wardId: string
│       ├── wardNumber: number      # Denormalized
│       ├── scheduledDate: timestamp
│       ├── scheduledTime: string   # "09:00 AM"
│       ├── messageText: string
│       ├── messageTextNe: string   # Nepali version
│       ├── status: string          # "scheduled", "sent", "completed", "cancelled"
│       ├── createdBy: string       # Admin UID
│       ├── createdAt: timestamp
│       ├── sentAt: timestamp
│       ├── parentNotificationId: string  # For rescheduled pickups
│       ├── responseStats: map
│       │   ├── yesCount: number
│       │   ├── noCount: number
│       │   └── totalCustomers: number
│       └── isRescheduled: boolean
│
├── responses/
│   └── {responseId}/               # notificationId_customerId
│       ├── notificationId: string
│       ├── customerId: string
│       ├── customerName: string    # Denormalized
│       ├── wardId: string
│       ├── wardNumber: number
│       ├── response: string        # "yes" or "no"
│       ├── respondedAt: timestamp
│       └── updatedAt: timestamp
│
└── fcmTopics/                      # For tracking topic subscriptions
    └── {topicName}/                # "ward_1", "ward_2", etc.
        └── subscribers: array      # Customer UIDs
```

### Example Documents

#### Ward Document
```json
{
  "wardNumber": 5,
  "name": "Ward 5 - Baneshwor",
  "nameNe": "वडा ५ - बानेश्वर",
  "customerCount": 245,
  "isActive": true
}
```

#### Customer Document
```json
{
  "phoneNumber": "+9779841234567",
  "name": "Ram Sharma",
  "wardId": "ward_5",
  "wardNumber": 5,
  "fcmToken": "dGhpcyBpcyBhIHNhbXBsZSB0b2tlbg...",
  "language": "ne",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:22:00Z",
  "isActive": true
}
```

#### Notification Document
```json
{
  "wardId": "ward_5",
  "wardNumber": 5,
  "scheduledDate": "2025-02-01T00:00:00Z",
  "scheduledTime": "09:00 AM",
  "messageText": "Waste pickup scheduled for Ward 5 on Feb 1st at 9:00 AM. Please keep your waste ready.",
  "messageTextNe": "वडा ५ को लागि फेब्रुअरी १ तारिख बिहान ९ बजे फोहोर संकलन हुनेछ। कृपया फोहोर तयार राख्नुहोस्।",
  "status": "sent",
  "createdBy": "admin_uid_123",
  "createdAt": "2025-01-31T08:00:00Z",
  "sentAt": "2025-01-31T08:00:05Z",
  "parentNotificationId": null,
  "responseStats": {
    "yesCount": 180,
    "noCount": 45,
    "totalCustomers": 245
  },
  "isRescheduled": false
}
```

#### Response Document
```json
{
  "notificationId": "notif_abc123",
  "customerId": "customer_uid_456",
  "customerName": "Ram Sharma",
  "wardId": "ward_5",
  "wardNumber": 5,
  "response": "yes",
  "respondedAt": "2025-01-31T08:15:30Z",
  "updatedAt": "2025-01-31T08:15:30Z"
}
```

### Firestore Indexes

```javascript
// Required Composite Indexes

// 1. Notifications by ward and date (for customer app)
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "wardNumber", order: "ASCENDING" },
    { fieldPath: "scheduledDate", order: "DESCENDING" }
  ]
}

// 2. Notifications by status and date (for admin)
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 3. Responses by notification (for viewing responses)
{
  collectionGroup: "responses",
  fields: [
    { fieldPath: "notificationId", order: "ASCENDING" },
    { fieldPath: "respondedAt", order: "DESCENDING" }
  ]
}

// 4. Responses by customer (for customer history)
{
  collectionGroup: "responses",
  fields: [
    { fieldPath: "customerId", order: "ASCENDING" },
    { fieldPath: "respondedAt", order: "DESCENDING" }
  ]
}

// 5. Customers by ward (for admin viewing)
{
  collectionGroup: "customers",
  fields: [
    { fieldPath: "wardNumber", order: "ASCENDING" },
    { fieldPath: "name", order: "ASCENDING" }
  ]
}
```

---

## 5. Backend Plan

### Firebase Services Used

| Service | Purpose |
|---------|---------|
| **Firebase Authentication** | Phone OTP for customers, Email/Password for admins |
| **Cloud Firestore** | Primary database |
| **Cloud Functions** | Backend logic, FCM triggers |
| **Cloud Messaging (FCM)** | Push notifications |
| **Firebase Hosting** | Admin web dashboard |

### Cloud Functions Architecture

```
functions/
├── src/
│   ├── index.ts                 # Function exports
│   ├── auth/
│   │   ├── onCustomerCreate.ts  # Set custom claims, subscribe to topic
│   │   └── onAdminCreate.ts     # Set admin custom claims
│   ├── notifications/
│   │   ├── onCreate.ts          # Trigger FCM when notification created
│   │   ├── onResponseWrite.ts   # Update response stats
│   │   └── scheduleCleanup.ts   # Archive old notifications
│   ├── customers/
│   │   ├── onWardChange.ts      # Update topic subscription
│   │   └── updateFcmToken.ts    # Callable function
│   └── admin/
│       ├── createNotification.ts # Callable with validation
│       └── reschedulePickup.ts   # Callable function
├── package.json
└── tsconfig.json
```

### Key Cloud Functions

#### 1. onCustomerCreate (Auth Trigger)
```typescript
// Triggered when new customer registers
// - Creates customer document in Firestore
// - Sets custom claims { role: "customer" }
// - Subscribes to ward FCM topic
```

#### 2. onNotificationCreate (Firestore Trigger)
```typescript
// Triggered when admin creates notification
// - Sends FCM to ward topic (e.g., "ward_5")
// - Updates notification status to "sent"
// - Logs sentAt timestamp
```

#### 3. onResponseWrite (Firestore Trigger)
```typescript
// Triggered when customer submits/updates response
// - Increments/updates yesCount or noCount
// - Uses transactions for atomic updates
```

#### 4. createNotification (Callable)
```typescript
// Called by admin dashboard
// - Validates admin role
// - Validates ward exists
// - Creates notification document
// - Returns notification ID
```

### Firestore Read/Write Patterns

#### Customer App Reads
```typescript
// Get notifications for customer's ward (last 30 days)
db.collection('notifications')
  .where('wardNumber', '==', customerWardNumber)
  .where('scheduledDate', '>=', thirtyDaysAgo)
  .orderBy('scheduledDate', 'desc')
  .limit(20)

// Get customer's responses
db.collection('responses')
  .where('customerId', '==', currentUserId)
  .orderBy('respondedAt', 'desc')
  .limit(50)

// Real-time listener for new notifications
db.collection('notifications')
  .where('wardNumber', '==', customerWardNumber)
  .where('status', '==', 'sent')
  .orderBy('createdAt', 'desc')
  .limit(5)
  .onSnapshot(...)
```

#### Customer App Writes
```typescript
// Submit response (create or update)
const responseId = `${notificationId}_${customerId}`
db.collection('responses').doc(responseId).set({
  notificationId,
  customerId,
  customerName,
  wardId,
  wardNumber,
  response: 'yes', // or 'no'
  respondedAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}, { merge: true })

// Update FCM token
db.collection('customers').doc(customerId).update({
  fcmToken: newToken,
  updatedAt: serverTimestamp()
})
```

#### Admin Dashboard Reads
```typescript
// Get all notifications with pagination
db.collection('notifications')
  .orderBy('createdAt', 'desc')
  .limit(50)

// Get responses for a notification
db.collection('responses')
  .where('notificationId', '==', notifId)
  .orderBy('respondedAt', 'desc')

// Get ward statistics
db.collection('wards')
  .orderBy('wardNumber', 'asc')
```

---

## 6. Push Notification Flow

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PUSH NOTIFICATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐        │
│  │   Admin     │         │  Firebase   │         │   Cloud     │        │
│  │  Dashboard  │────────▶│  Firestore  │────────▶│  Function   │        │
│  │             │ create  │             │ trigger │             │        │
│  │  (React)    │ notif   │ /notifs/xyz │         │ onCreate    │        │
│  └─────────────┘         └─────────────┘         └──────┬──────┘        │
│                                                         │               │
│                                                         │ send FCM      │
│                                                         ▼               │
│                                                  ┌─────────────┐        │
│                                                  │   Firebase  │        │
│                                                  │    Cloud    │        │
│                                                  │  Messaging  │        │
│                                                  └──────┬──────┘        │
│                                                         │               │
│                          topic: "ward_5"                │               │
│                                                         ▼               │
│         ┌───────────────────────────────────────────────────────┐       │
│         │                                                       │       │
│         ▼                    ▼                    ▼              │       │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │       │
│  │  Customer   │     │  Customer   │     │  Customer   │  ...  │       │
│  │  iPhone 1   │     │  iPhone 2   │     │  iPhone 3   │       │       │
│  │  (Ward 5)   │     │  (Ward 5)   │     │  (Ward 5)   │       │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │       │
│                                                                 │       │
└─────────────────────────────────────────────────────────────────────────┘
```

### FCM Topic Strategy

```typescript
// Topic naming convention
const getWardTopic = (wardNumber: number) => `ward_${wardNumber}`

// Example topics:
// ward_1, ward_2, ward_3, ... ward_32
```

### Customer Topic Subscription Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 TOPIC SUBSCRIPTION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. REGISTRATION                                                 │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│     │ Customer │───▶│  Select  │───▶│ Cloud Fn │                │
│     │ Registers│    │  Ward 5  │    │ Triggers │                │
│     └──────────┘    └──────────┘    └────┬─────┘                │
│                                          │                       │
│                                          ▼                       │
│                                   Subscribe to                   │
│                                   topic: "ward_5"                │
│                                                                  │
│  2. WARD CHANGE                                                  │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│     │ Customer │───▶│  Change  │───▶│ Cloud Fn │                │
│     │ Profile  │    │  Ward 7  │    │ Triggers │                │
│     └──────────┘    └──────────┘    └────┬─────┘                │
│                                          │                       │
│                                          ▼                       │
│                                   Unsubscribe "ward_5"           │
│                                   Subscribe "ward_7"             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### FCM Payload Structure

```typescript
// Notification payload sent to ward topic
const payload = {
  notification: {
    title: 'Waste Pickup Scheduled',
    title_loc_key: 'NOTIF_TITLE_PICKUP', // For i18n
    body: 'Pickup for Ward 5 on Feb 1 at 9:00 AM',
    body_loc_key: 'NOTIF_BODY_PICKUP',
    body_loc_args: ['5', 'Feb 1', '9:00 AM'],
    sound: 'default',
    badge: '1'
  },
  data: {
    notificationId: 'notif_abc123',
    wardNumber: '5',
    scheduledDate: '2025-02-01',
    scheduledTime: '09:00 AM',
    type: 'pickup_scheduled'
  },
  apns: {
    payload: {
      aps: {
        'mutable-content': 1,
        'content-available': 1
      }
    }
  }
}
```

### iOS Push Handling

```swift
// In AppDelegate or App struct
func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse
) {
    let userInfo = response.notification.request.content.userInfo

    if let notificationId = userInfo["notificationId"] as? String {
        // Navigate to notification detail
        NotificationRouter.shared.navigateTo(notificationId: notificationId)
    }
}
```

---

## 7. Security Rules Approach

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if user is the document owner
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Check if user has admin role (custom claim)
    function isAdmin() {
      return isAuthenticated() &&
             request.auth.token.role == 'admin';
    }

    // Check if user has super_admin role
    function isSuperAdmin() {
      return isAuthenticated() &&
             request.auth.token.role == 'super_admin';
    }

    // Check if user is any type of admin
    function isAnyAdmin() {
      return isAdmin() || isSuperAdmin();
    }

    // Get customer's ward number from their profile
    function getCustomerWard() {
      return get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.wardNumber;
    }

    // ============================================
    // ORGANIZATION RULES
    // ============================================
    match /organizations/{orgId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }

    // ============================================
    // WARD RULES
    // ============================================
    match /wards/{wardId} {
      // Anyone authenticated can read wards
      allow read: if isAuthenticated();

      // Only admins can modify wards
      allow create, update, delete: if isAnyAdmin();
    }

    // ============================================
    // CUSTOMER RULES
    // ============================================
    match /customers/{customerId} {
      // Customers can read their own profile
      // Admins can read any customer
      allow read: if isOwner(customerId) || isAnyAdmin();

      // Customers can create their own profile (during registration)
      allow create: if isOwner(customerId) &&
                       request.resource.data.keys().hasAll(['phoneNumber', 'name', 'wardNumber']) &&
                       request.resource.data.wardNumber is int &&
                       request.resource.data.wardNumber >= 1 &&
                       request.resource.data.wardNumber <= 32;

      // Customers can update their own profile (limited fields)
      allow update: if isOwner(customerId) &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['name', 'wardNumber', 'fcmToken', 'language', 'updatedAt']) &&
                       (request.resource.data.wardNumber is int &&
                        request.resource.data.wardNumber >= 1 &&
                        request.resource.data.wardNumber <= 32);

      // Admins can update any customer
      allow update: if isAnyAdmin();

      // Only super admins can delete customers
      allow delete: if isSuperAdmin();
    }

    // ============================================
    // ADMIN RULES
    // ============================================
    match /admins/{adminId} {
      // Admins can read their own profile
      // Super admins can read any admin
      allow read: if isOwner(adminId) || isSuperAdmin();

      // Only super admins can create/modify admins
      allow create, update, delete: if isSuperAdmin();
    }

    // ============================================
    // NOTIFICATION RULES
    // ============================================
    match /notifications/{notificationId} {
      // Customers can only read notifications for their ward
      allow read: if isAuthenticated() &&
                    (resource.data.wardNumber == getCustomerWard() || isAnyAdmin());

      // Only admins can create notifications
      allow create: if isAnyAdmin() &&
                       request.resource.data.keys().hasAll([
                         'wardId', 'wardNumber', 'scheduledDate',
                         'scheduledTime', 'messageText', 'status', 'createdBy'
                       ]) &&
                       request.resource.data.status == 'scheduled';

      // Only admins can update notifications
      allow update: if isAnyAdmin();

      // Only super admins can delete notifications
      allow delete: if isSuperAdmin();
    }

    // ============================================
    // RESPONSE RULES
    // ============================================
    match /responses/{responseId} {
      // Customers can read their own responses
      // Admins can read all responses
      allow read: if isAuthenticated() &&
                    (resource.data.customerId == request.auth.uid || isAnyAdmin());

      // Customers can create/update their own response only
      // Response ID must be notificationId_customerId format
      allow create: if isAuthenticated() &&
                       request.resource.data.customerId == request.auth.uid &&
                       responseId == request.resource.data.notificationId + '_' + request.auth.uid &&
                       request.resource.data.response in ['yes', 'no'];

      allow update: if isAuthenticated() &&
                       resource.data.customerId == request.auth.uid &&
                       request.resource.data.customerId == request.auth.uid &&
                       request.resource.data.response in ['yes', 'no'];

      // Only admins can delete responses (for cleanup)
      allow delete: if isAnyAdmin();
    }

    // ============================================
    // FCM TOPICS (for admin visibility)
    // ============================================
    match /fcmTopics/{topicId} {
      allow read: if isAnyAdmin();
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

### Firebase Authentication Custom Claims Setup

```typescript
// Cloud Function to set custom claims
import * as admin from 'firebase-admin';

// Set customer role on registration
export const setCustomerClaims = functions.auth.user().onCreate(async (user) => {
  // Check if this is a phone auth user (customer)
  if (user.phoneNumber) {
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'customer'
    });
  }
});

// Callable function for super admin to create admins
export const createAdmin = functions.https.onCall(async (data, context) => {
  // Verify caller is super admin
  if (context.auth?.token?.role !== 'super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }

  const { email, password, name, role } = data;

  // Create the user
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: name
  });

  // Set admin claims
  await admin.auth().setCustomUserClaims(userRecord.uid, {
    role: role // 'admin' or 'super_admin'
  });

  // Create admin document
  await admin.firestore().collection('admins').doc(userRecord.uid).set({
    email,
    name,
    role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true
  });

  return { uid: userRecord.uid };
});
```

### Security Best Practices Implemented

1. **Principle of Least Privilege**: Customers can only access their ward's data
2. **Custom Claims for Roles**: Admin roles stored in JWT, not queryable by attackers
3. **Field-Level Validation**: Restrict which fields customers can modify
4. **Data Integrity**: Response IDs enforced to prevent duplicate/fake responses
5. **Audit Trail**: `createdBy` field on notifications for accountability

---

## 8. iOS Architecture Plan

### Project Structure

```
KWBPN/
├── KWBPN.xcodeproj
├── KWBPN/
│   ├── App/
│   │   ├── KWBPNApp.swift              # App entry point
│   │   ├── AppDelegate.swift           # Push notification setup
│   │   └── AppState.swift              # Global app state
│   │
│   ├── Core/
│   │   ├── DI/
│   │   │   └── DependencyContainer.swift
│   │   ├── Extensions/
│   │   │   ├── Date+Extensions.swift
│   │   │   ├── String+Extensions.swift
│   │   │   └── View+Extensions.swift
│   │   ├── Utilities/
│   │   │   ├── Constants.swift
│   │   │   ├── Logger.swift
│   │   │   └── Haptics.swift
│   │   └── Networking/
│   │       └── NetworkMonitor.swift
│   │
│   ├── Services/
│   │   ├── AuthService.swift           # Firebase Auth wrapper
│   │   ├── FirestoreService.swift      # Firestore operations
│   │   ├── NotificationService.swift   # FCM handling
│   │   ├── CustomerService.swift       # Customer CRUD
│   │   ├── PickupNotificationService.swift
│   │   └── ResponseService.swift
│   │
│   ├── Models/
│   │   ├── Customer.swift
│   │   ├── Ward.swift
│   │   ├── PickupNotification.swift
│   │   ├── PickupResponse.swift
│   │   └── AppError.swift
│   │
│   ├── Features/
│   │   ├── Onboarding/
│   │   │   ├── Views/
│   │   │   │   ├── OnboardingView.swift
│   │   │   │   ├── PhoneInputView.swift
│   │   │   │   ├── OTPVerificationView.swift
│   │   │   │   └── ProfileSetupView.swift
│   │   │   └── ViewModels/
│   │   │       └── OnboardingViewModel.swift
│   │   │
│   │   ├── Home/
│   │   │   ├── Views/
│   │   │   │   ├── HomeView.swift
│   │   │   │   ├── NotificationCard.swift
│   │   │   │   ├── ResponseButtons.swift
│   │   │   │   └── EmptyStateView.swift
│   │   │   └── ViewModels/
│   │   │       └── HomeViewModel.swift
│   │   │
│   │   ├── NotificationDetail/
│   │   │   ├── Views/
│   │   │   │   └── NotificationDetailView.swift
│   │   │   └── ViewModels/
│   │   │       └── NotificationDetailViewModel.swift
│   │   │
│   │   ├── History/
│   │   │   ├── Views/
│   │   │   │   ├── HistoryView.swift
│   │   │   │   └── HistoryRow.swift
│   │   │   └── ViewModels/
│   │   │       └── HistoryViewModel.swift
│   │   │
│   │   └── Profile/
│   │       ├── Views/
│   │       │   ├── ProfileView.swift
│   │       │   ├── EditProfileView.swift
│   │       │   └── LanguagePickerView.swift
│   │       └── ViewModels/
│   │           └── ProfileViewModel.swift
│   │
│   ├── Navigation/
│   │   ├── Router.swift
│   │   ├── TabRouter.swift
│   │   └── DeepLinkHandler.swift
│   │
│   ├── Components/
│   │   ├── Buttons/
│   │   │   ├── PrimaryButton.swift
│   │   │   ├── ResponseButton.swift
│   │   │   └── LoadingButton.swift
│   │   ├── Inputs/
│   │   │   ├── PhoneTextField.swift
│   │   │   ├── OTPTextField.swift
│   │   │   └── WardPicker.swift
│   │   ├── Cards/
│   │   │   └── NotificationCard.swift
│   │   └── Common/
│   │       ├── LoadingView.swift
│   │       ├── ErrorView.swift
│   │       └── StatusBadge.swift
│   │
│   ├── Resources/
│   │   ├── Assets.xcassets
│   │   ├── Localizable.strings         # English
│   │   ├── ne.lproj/
│   │   │   └── Localizable.strings     # Nepali
│   │   ├── GoogleService-Info.plist
│   │   └── Colors.swift
│   │
│   └── Persistence/
│       ├── UserDefaultsManager.swift
│       └── OfflineStorage.swift        # Core Data or cached Firestore
│
├── KWBPNTests/
│   └── ...
│
└── KWBPNUITests/
    └── ...
```

### MVVM Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MVVM + SERVICES ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │    VIEW     │  SwiftUI Views                                 │
│  │  (SwiftUI)  │  - Declarative UI                              │
│  │             │  - Observes ViewModel                          │
│  └──────┬──────┘  - Sends user actions                          │
│         │                                                        │
│         │ @StateObject / @ObservedObject                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │  VIEWMODEL  │  @MainActor class                              │
│  │             │  - @Published properties                        │
│  │             │  - UI state management                          │
│  │             │  - Calls services                               │
│  └──────┬──────┘  - Error handling                               │
│         │                                                        │
│         │ Dependency Injection                                   │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │  SERVICES   │  Singleton / Injected                          │
│  │             │  - AuthService                                  │
│  │             │  - FirestoreService                             │
│  │             │  - NotificationService                          │
│  └──────┬──────┘  - async/await APIs                             │
│         │                                                        │
│         │ Firebase SDK                                           │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │  FIREBASE   │  External Services                             │
│  │             │  - Authentication                               │
│  │             │  - Firestore                                    │
│  │             │  - Cloud Messaging                              │
│  └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Implementation Patterns

#### 1. Service Protocol Pattern
```swift
// Protocol for testability
protocol AuthServiceProtocol {
    func sendOTP(phoneNumber: String) async throws
    func verifyOTP(code: String) async throws -> User
    func signOut() throws
    var currentUser: User? { get }
}

// Implementation
final class AuthService: AuthServiceProtocol {
    static let shared = AuthService()
    // ...
}
```

#### 2. ViewModel Pattern
```swift
@MainActor
final class HomeViewModel: ObservableObject {
    // Published state
    @Published private(set) var notifications: [PickupNotification] = []
    @Published private(set) var isLoading = false
    @Published private(set) var error: AppError?

    // Dependencies
    private let notificationService: PickupNotificationServiceProtocol
    private let responseService: ResponseServiceProtocol

    init(
        notificationService: PickupNotificationServiceProtocol = PickupNotificationService.shared,
        responseService: ResponseServiceProtocol = ResponseService.shared
    ) {
        self.notificationService = notificationService
        self.responseService = responseService
    }

    // Actions
    func loadNotifications() async {
        isLoading = true
        defer { isLoading = false }

        do {
            notifications = try await notificationService.fetchForCurrentWard()
        } catch {
            self.error = AppError(error)
        }
    }

    func submitResponse(_ response: ResponseType, for notification: PickupNotification) async {
        do {
            try await responseService.submit(response, for: notification.id)
        } catch {
            self.error = AppError(error)
        }
    }
}
```

#### 3. Offline Support Strategy
```swift
// Using Firestore's built-in offline persistence
let settings = FirestoreSettings()
settings.cacheSettings = PersistentCacheSettings(sizeBytes: 100_000_000) // 100MB
Firestore.firestore().settings = settings

// Snapshot listener with metadata for online/offline status
db.collection("notifications")
    .whereField("wardNumber", isEqualTo: wardNumber)
    .addSnapshotListener(includeMetadataChanges: true) { snapshot, error in
        guard let snapshot = snapshot else { return }

        let isFromCache = snapshot.metadata.isFromCache
        // Update UI to show offline indicator if needed
    }
```

### Dependencies (Swift Package Manager)

```swift
// Package.swift dependencies
dependencies: [
    .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "10.0.0"),
]

// Products used:
// - FirebaseAuth
// - FirebaseFirestore
// - FirebaseMessaging
// - FirebaseAnalytics (optional)
```

---

## 9. Admin Dashboard Architecture

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **TailwindCSS** | Styling |
| **React Router v6** | Navigation |
| **React Query** | Server state management |
| **Firebase SDK** | Backend integration |
| **Recharts** | Charts and analytics |
| **React Hook Form** | Form handling |
| **Zod** | Validation |

### Project Structure

```
admin-dashboard/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── config/
│   │   └── firebase.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── notification.ts
│   │   ├── customer.ts
│   │   ├── ward.ts
│   │   └── response.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── notification.service.ts
│   │   ├── ward.service.ts
│   │   ├── customer.service.ts
│   │   └── response.service.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useNotifications.ts
│   │   ├── useWards.ts
│   │   ├── useResponses.ts
│   │   └── useRealtimeNotifications.ts
│   │
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Loading.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   └── features/
│   │       ├── NotificationForm.tsx
│   │       ├── ResponseTable.tsx
│   │       ├── WardSelector.tsx
│   │       ├── StatsCard.tsx
│   │       └── ResponseChart.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── CreateNotificationPage.tsx
│   │   │   └── NotificationDetailPage.tsx
│   │   ├── wards/
│   │   │   └── WardsPage.tsx
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── utils/
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   │
│   └── styles/
│       └── globals.css
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── .env.example
```

### Key Pages Wireframes

#### Dashboard Page
```
┌─────────────────────────────────────────────────────────────────┐
│  KWBPN Admin Dashboard                           [Admin ▼]       │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                     │
│  Dashboard │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  ────────  │  │ Total   │ │ Pending │ │ Today's │ │ Response│  │
│  Wards     │  │ Notifs  │ │ Notifs  │ │ Pickups │ │ Rate    │  │
│  Notifs    │  │   156   │ │    3    │ │    5    │ │  78%    │  │
│  Settings  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│            │                                                     │
│            │  Recent Notifications                               │
│            │  ┌───────────────────────────────────────────────┐ │
│            │  │ Ward │ Date     │ Status │ YES │ NO  │ Action │ │
│            │  ├───────────────────────────────────────────────┤ │
│            │  │  5   │ Feb 1    │ Sent   │ 180 │ 45  │ View   │ │
│            │  │  12  │ Feb 1    │ Sent   │ 95  │ 20  │ View   │ │
│            │  │  3   │ Jan 31   │ Done   │ 150 │ 30  │ View   │ │
│            │  └───────────────────────────────────────────────┘ │
│            │                                                     │
└────────────┴────────────────────────────────────────────────────┘
```

#### Create Notification Page
```
┌─────────────────────────────────────────────────────────────────┐
│  Create Pickup Notification                      [Admin ▼]       │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                     │
│  Dashboard │  Create New Notification                            │
│  ────────  │  ─────────────────────────                         │
│  Wards     │                                                     │
│  > Notifs  │  Ward *                                             │
│  Settings  │  ┌─────────────────────────────────┐               │
│            │  │ Select Ward                   ▼ │               │
│            │  └─────────────────────────────────┘               │
│            │                                                     │
│            │  Date *                 Time *                      │
│            │  ┌──────────────┐      ┌──────────────┐            │
│            │  │ Feb 1, 2025  │      │ 09:00 AM     │            │
│            │  └──────────────┘      └──────────────┘            │
│            │                                                     │
│            │  Message (English) *                                │
│            │  ┌─────────────────────────────────────────────┐   │
│            │  │ Waste pickup scheduled for Ward 5...        │   │
│            │  │                                             │   │
│            │  └─────────────────────────────────────────────┘   │
│            │                                                     │
│            │  Message (Nepali)                                   │
│            │  ┌─────────────────────────────────────────────┐   │
│            │  │ वडा ५ को लागि फोहोर संकलन...                    │   │
│            │  └─────────────────────────────────────────────┘   │
│            │                                                     │
│            │  ┌──────────────────┐                              │
│            │  │  Send Notification │                             │
│            │  └──────────────────┘                              │
│            │                                                     │
└────────────┴────────────────────────────────────────────────────┘
```

### React Query Integration

```typescript
// hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useNotificationResponses = (notificationId: string) => {
  return useQuery({
    queryKey: ['responses', notificationId],
    queryFn: () => notificationService.getResponses(notificationId),
    enabled: !!notificationId,
  });
};
```

---

## 10. Milestones (Week-by-Week MVP Plan)

### Week 1: Foundation & Setup

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Firebase project setup | Firebase console configured, SDK initialized |
| 1-2 | iOS project setup | Xcode project with SwiftUI, folder structure |
| 2-3 | Admin dashboard setup | React + Vite + Tailwind initialized |
| 3-4 | Data models | Swift models, TypeScript types defined |
| 4-5 | Firestore collections | Collections created, sample data seeded |
| 5 | Security rules v1 | Basic rules deployed |

**Week 1 Demo**: Empty apps connecting to Firebase, sample data visible in Firestore

### Week 2: Authentication

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | iOS Phone OTP flow | PhoneInputView, OTPVerificationView working |
| 2-3 | iOS Profile setup | ProfileSetupView, ward picker |
| 3-4 | Admin login | Email/password auth on web |
| 4-5 | Auth state management | Persistent login, logout on both platforms |
| 5 | Custom claims setup | Cloud Function for admin roles |

**Week 2 Demo**: Full auth flow on iOS and web, users can register and login

### Week 3: Core Features - Notifications

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Admin: Create notification form | Form with ward selector, date picker |
| 2-3 | Admin: Notification list | Table view of all notifications |
| 3-4 | iOS: Home screen | NotificationCard displaying latest |
| 4-5 | iOS: History screen | List of past notifications |
| 5 | iOS: Detail screen | Full notification detail view |

**Week 3 Demo**: Admin can create notifications, iOS app displays them

### Week 4: Push Notifications & Responses

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | FCM setup iOS | APNs certificates, FCM configuration |
| 2-3 | Cloud Function: send push | Trigger on notification create |
| 3-4 | iOS: Receive & handle push | Notification appears, tap opens detail |
| 4-5 | iOS: YES/NO response | Buttons work, response saved to Firestore |
| 5 | Admin: View responses | Response table per notification |

**Week 4 Demo**: Full loop - admin sends, customer receives push, responds, admin sees response

### Week 5: Polish & Offline

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | iOS: Offline support | Notifications cached, work without internet |
| 2-3 | iOS: i18n setup | Nepali strings, language toggle |
| 3-4 | Admin: Response stats | Charts, YES/NO counts |
| 4-5 | Admin: Reschedule feature | Create linked notification |
| 5 | UI polish | Consistent styling, loading states |

**Week 5 Demo**: Polished MVP with offline support and Nepali language

### Week 6: Testing & Documentation

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Bug fixes | Address issues from testing |
| 2-3 | Security rules audit | Tighten rules, test edge cases |
| 3-4 | Documentation | README, setup guide, API docs |
| 4-5 | Demo preparation | Presentation slides, demo script |
| 5 | Final testing | End-to-end test all flows |

**Week 6 Demo**: Production-ready MVP for viva/presentation

---

## 11. Future Features / Brainstorming

### Phase 2 Features (Post-MVP)

#### Smart Scheduling
- **AI-based optimal pickup time**: Analyze response patterns to suggest best times
- **Weather integration**: Reschedule automatically if heavy rain predicted
- **Holiday awareness**: Avoid scheduling on Nepali holidays (Dashain, Tihar, etc.)

#### Enhanced Customer Experience
- **Pickup reminders**: Push notification 1 hour before scheduled time
- **Feedback system**: Rate pickup quality (1-5 stars)
- **Complaint submission**: Report missed pickups or issues
- **Photo upload**: Customers can photo-document waste ready for pickup

#### Admin Analytics
- **Response rate trends**: Track which wards respond best/worst
- **Time-of-day analysis**: When do customers respond fastest?
- **Heatmaps**: Visual representation of response data
- **Export to Excel/PDF**: Generate reports for municipal meetings

#### Communication
- **Two-way messaging**: Customers can send messages to admin
- **Announcements**: General announcements (not ward-specific)
- **SMS fallback**: For customers without smartphones

### Phase 3 Features (Scale)

#### Multi-Organization
- **Multiple municipalities**: Each with their own admin portal
- **White-label solution**: Rebrand for different cities

#### Route Optimization
- **GPS tracking**: Track garbage trucks in real-time
- **Customer can see ETA**: "Truck is 15 minutes away"
- **Route optimization**: ML-based optimal route for drivers

#### Gamification
- **Recycling rewards**: Points for proper waste segregation
- **Ward leaderboards**: Which ward has best response rate
- **Badges**: "Consistent Responder", "Early Bird"

#### Integration
- **Government systems**: Connect with KMC waste management database
- **Payment integration**: For paid/premium services
- **Third-party logistics**: Integration with private waste collectors

### Technical Improvements

#### Performance
- **Edge caching**: Use Firebase Hosting CDN
- **Image optimization**: Compress notification images
- **Lazy loading**: Load history on scroll

#### Security
- **Rate limiting**: Prevent spam responses
- **Anomaly detection**: Flag unusual response patterns
- **Audit logs**: Track all admin actions

#### DevOps
- **CI/CD pipeline**: GitHub Actions for automated deployment
- **Staging environment**: Separate Firebase project for testing
- **Monitoring**: Firebase Crashlytics, Performance Monitoring

---

## Quick Reference

### Firebase Collection Paths
```
/wards/{wardId}
/customers/{customerId}
/admins/{adminId}
/notifications/{notificationId}
/responses/{notificationId}_{customerId}
```

### FCM Topic Pattern
```
ward_{wardNumber}  // e.g., ward_1, ward_5, ward_32
```

### Customer Auth Flow
```
Phone Input → Send OTP → Verify OTP → Profile Setup → Home
```

### Admin Auth Flow
```
Email/Password → Dashboard
```

### Response Flow
```
Admin Creates → Cloud Function Triggers → FCM Sent → Customer Receives → Opens App → Responds → Firestore Updated → Admin Sees
```

---

*Document Version: 1.1*
*Last Updated: February 2026*
*Project: KWPM - Kathmandu Waste Pickup Management*
*Since 2026*
