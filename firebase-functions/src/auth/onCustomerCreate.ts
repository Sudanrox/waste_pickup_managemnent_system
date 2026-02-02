/**
 * onCustomerCreate
 *
 * Triggered when a new user registers via phone authentication.
 * - Sets custom claims for customer role
 * - Note: FCM topic subscription happens after profile setup
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;

export const onCustomerCreate = functions
  .region("asia-south1") // Mumbai region (closest to Nepal)
  .auth.user()
  .onCreate(async (user) => {
    // Only process phone auth users (customers)
    if (!user.phoneNumber) {
      logger.info(`User ${user.uid} created without phone number - skipping customer setup`);
      return null;
    }

    logger.info(`New customer registered: ${user.uid}, phone: ${user.phoneNumber}`);

    try {
      // Set custom claims for customer role
      await admin.auth().setCustomUserClaims(user.uid, {
        role: "customer",
      });

      logger.info(`Custom claims set for customer: ${user.uid}`);

      // Note: Customer document and FCM subscription will be created
      // when user completes profile setup in the app

      return { success: true, uid: user.uid };
    } catch (error) {
      logger.error(`Error setting up customer ${user.uid}:`, error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to setup customer account"
      );
    }
  });
