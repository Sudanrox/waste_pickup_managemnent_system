/**
 * onResponseWrite
 *
 * Triggered when a customer creates or updates their response.
 * Updates the responseStats counters on the notification document.
 * Uses transactions for atomic updates.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();

interface ResponseData {
  notificationId: string;
  customerId: string;
  customerName: string;
  wardId: string;
  wardNumber: number;
  response: "yes" | "no";
  respondedAt: admin.firestore.Timestamp;
}

export const onResponseWrite = functions
  .region("asia-south1")
  .firestore.document("responses/{responseId}")
  .onWrite(async (change, context) => {
    const responseId = context.params.responseId;

    // Handle delete
    if (!change.after.exists) {
      logger.info(`Response ${responseId} was deleted`);

      const beforeData = change.before.data() as ResponseData;

      // Decrement the appropriate counter
      return await updateResponseStats(
        beforeData.notificationId,
        beforeData.response,
        "decrement"
      );
    }

    const afterData = change.after.data() as ResponseData;

    // Handle create (new response)
    if (!change.before.exists) {
      logger.info(
        `New response: ${responseId} - ${afterData.response} for notification ${afterData.notificationId}`
      );

      return await updateResponseStats(
        afterData.notificationId,
        afterData.response,
        "increment"
      );
    }

    // Handle update (changed response)
    const beforeData = change.before.data() as ResponseData;

    if (beforeData.response !== afterData.response) {
      logger.info(
        `Response changed: ${responseId} from ${beforeData.response} to ${afterData.response}`
      );

      // Use transaction to update both counters atomically
      const notificationRef = db
        .collection("notifications")
        .doc(afterData.notificationId);

      return await db.runTransaction(async (transaction) => {
        const notificationDoc = await transaction.get(notificationRef);

        if (!notificationDoc.exists) {
          logger.error(`Notification ${afterData.notificationId} not found`);
          return null;
        }

        const currentStats = notificationDoc.data()?.responseStats || {
          yesCount: 0,
          noCount: 0,
          totalCustomers: 0,
        };

        // Decrement old response counter
        if (beforeData.response === "yes") {
          currentStats.yesCount = Math.max(0, currentStats.yesCount - 1);
        } else {
          currentStats.noCount = Math.max(0, currentStats.noCount - 1);
        }

        // Increment new response counter
        if (afterData.response === "yes") {
          currentStats.yesCount += 1;
        } else {
          currentStats.noCount += 1;
        }

        transaction.update(notificationRef, {
          responseStats: currentStats,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info(
          `Updated stats for ${afterData.notificationId}: YES=${currentStats.yesCount}, NO=${currentStats.noCount}`
        );

        return { success: true, stats: currentStats };
      });
    }

    logger.debug(`Response ${responseId} updated but response value unchanged`);
    return null;
  });

/**
 * Helper function to increment/decrement response stats
 */
async function updateResponseStats(
  notificationId: string,
  response: "yes" | "no",
  operation: "increment" | "decrement"
): Promise<{ success: boolean; stats?: object } | null> {
  const notificationRef = db.collection("notifications").doc(notificationId);

  return await db.runTransaction(async (transaction) => {
    const notificationDoc = await transaction.get(notificationRef);

    if (!notificationDoc.exists) {
      logger.error(`Notification ${notificationId} not found`);
      return null;
    }

    const currentStats = notificationDoc.data()?.responseStats || {
      yesCount: 0,
      noCount: 0,
      totalCustomers: 0,
    };

    const delta = operation === "increment" ? 1 : -1;

    if (response === "yes") {
      currentStats.yesCount = Math.max(0, currentStats.yesCount + delta);
    } else {
      currentStats.noCount = Math.max(0, currentStats.noCount + delta);
    }

    transaction.update(notificationRef, {
      responseStats: currentStats,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(
      `Stats ${operation}ed for ${notificationId}: YES=${currentStats.yesCount}, NO=${currentStats.noCount}`
    );

    return { success: true, stats: currentStats };
  });
}
