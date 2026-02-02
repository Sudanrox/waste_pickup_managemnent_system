/**
 * createNotification
 *
 * Callable function for admins to create pickup notifications.
 * Validates input and creates the notification document.
 * The onCreate trigger will then send the FCM push.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();

interface CreateNotificationData {
  wardNumber: number;
  scheduledDate: string; // ISO date string
  scheduledTime: string;
  messageText: string;
  messageTextNe?: string;
}

export const createNotification = functions
  .region("asia-south1")
  .https.onCall(async (data: CreateNotificationData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to create notifications"
      );
    }

    // Verify admin role
    const role = context.auth.token.role;
    if (role !== "admin" && role !== "super_admin") {
      logger.warn(
        `Unauthorized notification creation attempt by ${context.auth.uid} (role: ${role})`
      );
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can create notifications"
      );
    }

    // Validate input
    const { wardNumber, scheduledDate, scheduledTime, messageText, messageTextNe } = data;

    if (!wardNumber || !scheduledDate || !scheduledTime || !messageText) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: wardNumber, scheduledDate, scheduledTime, messageText"
      );
    }

    if (wardNumber < 1 || wardNumber > 32) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Ward number must be between 1 and 32"
      );
    }

    // Parse and validate date
    const parsedDate = new Date(scheduledDate);
    if (isNaN(parsedDate.getTime())) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid scheduledDate format. Use ISO 8601 format."
      );
    }

    // Validate time format (HH:MM AM/PM)
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!timeRegex.test(scheduledTime)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid scheduledTime format. Use HH:MM AM/PM format."
      );
    }

    logger.info(
      `Admin ${context.auth.uid} creating notification for ward ${wardNumber}`
    );

    try {
      // Verify ward exists
      const wardId = `ward_${wardNumber}`;
      const wardDoc = await db.collection("wards").doc(wardId).get();

      if (!wardDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Ward ${wardNumber} not found`
        );
      }

      const wardData = wardDoc.data();
      const customerCount = wardData?.customerCount || 0;

      // Create notification document
      const notificationRef = db.collection("notifications").doc();
      const notificationData = {
        wardId: wardId,
        wardNumber: wardNumber,
        scheduledDate: admin.firestore.Timestamp.fromDate(parsedDate),
        scheduledTime: scheduledTime.toUpperCase(),
        messageText: messageText,
        messageTextNe: messageTextNe || messageText, // Default to English if Nepali not provided
        status: "scheduled",
        createdBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        parentNotificationId: null,
        isRescheduled: false,
        responseStats: {
          yesCount: 0,
          noCount: 0,
          totalCustomers: customerCount,
        },
      };

      await notificationRef.set(notificationData);

      logger.info(
        `Notification created: ${notificationRef.id} for ward ${wardNumber} by ${context.auth.uid}`
      );

      // Log to audit trail
      await db.collection("auditLogs").add({
        action: "NOTIFICATION_CREATED",
        notificationId: notificationRef.id,
        wardNumber: wardNumber,
        performedBy: context.auth.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        notificationId: notificationRef.id,
        wardNumber: wardNumber,
        customerCount: customerCount,
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      logger.error(`Error creating notification:`, error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create notification"
      );
    }
  });
