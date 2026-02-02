/**
 * KWPM - Cloud Functions
 * Kathmandu Waste Pickup Management
 *
 * Main entry point for all Cloud Functions
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// ============================================
// AUTH FUNCTIONS
// ============================================
export { onCustomerCreate } from "./auth/onCustomerCreate";
export { setAdminRole } from "./auth/setAdminRole";

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================
export { onNotificationCreate } from "./notifications/onCreate";
export { onNotificationUpdate } from "./notifications/onUpdate";

// ============================================
// RESPONSE FUNCTIONS
// ============================================
export { onResponseWrite } from "./notifications/onResponseWrite";

// ============================================
// CUSTOMER FUNCTIONS
// ============================================
export { onCustomerWardChange } from "./customers/onWardChange";
export { updateFcmToken } from "./customers/updateFcmToken";

// ============================================
// ADMIN FUNCTIONS
// ============================================
export { createNotification } from "./admin/createNotification";
export { reschedulePickup } from "./admin/reschedulePickup";
export { getWardStats } from "./admin/getWardStats";
