/**
 * updateFcmToken
 *
 * Callable function to update customer's FCM token.
 * Also handles FCM topic subscription for the customer's ward.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();
const messaging = admin.messaging();

interface UpdateFcmTokenData {
  token: string;
}

export const updateFcmToken = functions
  .region("asia-south1")
  .https.onCall(async (data: UpdateFcmTokenData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to update FCM token"
      );
    }

    const { token } = data;
    const customerId = context.auth.uid;

    if (!token || typeof token !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "FCM token is required"
      );
    }

    logger.info(`Updating FCM token for customer ${customerId}`);

    try {
      // Get customer document to find their ward
      const customerDoc = await db.collection("customers").doc(customerId).get();

      if (!customerDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Customer profile not found"
        );
      }

      const customerData = customerDoc.data();
      const oldToken = customerData?.fcmToken;
      const wardNumber = customerData?.wardNumber;

      if (!wardNumber) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Customer must have a ward assigned"
        );
      }

      const topic = `ward_${wardNumber}`;

      // Unsubscribe old token from topic if it exists and is different
      if (oldToken && oldToken !== token) {
        try {
          await messaging.unsubscribeFromTopic([oldToken], topic);
          logger.info(`Unsubscribed old token from topic ${topic}`);
        } catch (error) {
          logger.warn(`Failed to unsubscribe old token:`, error);
        }
      }

      // Subscribe new token to ward topic
      try {
        const response = await messaging.subscribeToTopic([token], topic);
        logger.info(
          `Subscribed to topic ${topic}: success=${response.successCount}, failure=${response.failureCount}`
        );

        if (response.failureCount > 0) {
          logger.warn(`Topic subscription errors:`, response.errors);
        }
      } catch (error) {
        logger.error(`Failed to subscribe to topic ${topic}:`, error);
        // Don't throw - still update the token in Firestore
      }

      // Update token in Firestore
      await db.collection("customers").doc(customerId).update({
        fcmToken: token,
        fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`FCM token updated for customer ${customerId}`);

      return {
        success: true,
        subscribedToTopic: topic,
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      logger.error(`Error updating FCM token for ${customerId}:`, error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update FCM token"
      );
    }
  });
