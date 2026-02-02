/**
 * onCustomerWardChange
 *
 * Triggered when a customer changes their ward.
 * - Unsubscribes from old ward FCM topic
 * - Subscribes to new ward FCM topic
 * - Updates ward customer counts
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();
const messaging = admin.messaging();

interface CustomerData {
  phoneNumber: string;
  name: string;
  wardId: string;
  wardNumber: number;
  fcmToken?: string;
  language: string;
  isActive: boolean;
}

export const onCustomerWardChange = functions
  .region("asia-south1")
  .firestore.document("customers/{customerId}")
  .onUpdate(async (change, context) => {
    const customerId = context.params.customerId;
    const beforeData = change.before.data() as CustomerData;
    const afterData = change.after.data() as CustomerData;

    // Check if ward changed
    if (beforeData.wardNumber === afterData.wardNumber) {
      return null;
    }

    logger.info(
      `Customer ${customerId} changed ward from ${beforeData.wardNumber} to ${afterData.wardNumber}`
    );

    const fcmToken = afterData.fcmToken;
    const oldTopic = `ward_${beforeData.wardNumber}`;
    const newTopic = `ward_${afterData.wardNumber}`;

    try {
      // Handle FCM topic subscriptions if token exists
      if (fcmToken) {
        // Unsubscribe from old ward topic
        try {
          await messaging.unsubscribeFromTopic([fcmToken], oldTopic);
          logger.info(`Unsubscribed ${customerId} from topic ${oldTopic}`);
        } catch (error) {
          logger.warn(`Failed to unsubscribe from ${oldTopic}:`, error);
        }

        // Subscribe to new ward topic
        try {
          await messaging.subscribeToTopic([fcmToken], newTopic);
          logger.info(`Subscribed ${customerId} to topic ${newTopic}`);
        } catch (error) {
          logger.warn(`Failed to subscribe to ${newTopic}:`, error);
        }
      }

      // Update ward customer counts
      const batch = db.batch();

      // Decrement old ward count
      const oldWardRef = db.collection("wards").doc(beforeData.wardId);
      batch.update(oldWardRef, {
        customerCount: admin.firestore.FieldValue.increment(-1),
      });

      // Increment new ward count
      const newWardRef = db.collection("wards").doc(afterData.wardId);
      batch.update(newWardRef, {
        customerCount: admin.firestore.FieldValue.increment(1),
      });

      await batch.commit();

      logger.info(
        `Updated ward counts: ${beforeData.wardId} -1, ${afterData.wardId} +1`
      );

      return {
        success: true,
        oldWard: beforeData.wardNumber,
        newWard: afterData.wardNumber,
      };
    } catch (error) {
      logger.error(`Error handling ward change for ${customerId}:`, error);
      throw error;
    }
  });
