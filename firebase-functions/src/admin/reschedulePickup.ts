/**
 * reschedulePickup
 *
 * Callable function for admins to reschedule a pickup.
 * Creates a new notification linked to the original one.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();

interface RescheduleData {
  originalNotificationId: string;
  newScheduledDate: string; // ISO date string
  newScheduledTime: string;
  messageText?: string;
  messageTextNe?: string;
  reason?: string;
}

export const reschedulePickup = functions
  .region("asia-south1")
  .https.onCall(async (data: RescheduleData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to reschedule pickups"
      );
    }

    // Verify admin role
    const role = context.auth.token.role;
    if (role !== "admin" && role !== "super_admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can reschedule pickups"
      );
    }

    // Validate input
    const {
      originalNotificationId,
      newScheduledDate,
      newScheduledTime,
      messageText,
      messageTextNe,
      reason,
    } = data;

    if (!originalNotificationId || !newScheduledDate || !newScheduledTime) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: originalNotificationId, newScheduledDate, newScheduledTime"
      );
    }

    logger.info(
      `Admin ${context.auth.uid} rescheduling notification ${originalNotificationId}`
    );

    try {
      // Get original notification
      const originalRef = db
        .collection("notifications")
        .doc(originalNotificationId);
      const originalDoc = await originalRef.get();

      if (!originalDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Original notification not found"
        );
      }

      const originalData = originalDoc.data()!;

      // Parse new date
      const parsedDate = new Date(newScheduledDate);
      if (isNaN(parsedDate.getTime())) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid newScheduledDate format"
        );
      }

      // Get ward customer count
      const wardDoc = await db.collection("wards").doc(originalData.wardId).get();
      const customerCount = wardDoc.exists
        ? wardDoc.data()?.customerCount || 0
        : originalData.responseStats?.totalCustomers || 0;

      // Create new notification
      const newNotificationRef = db.collection("notifications").doc();

      const defaultMessage = `This pickup has been rescheduled. New time: ${newScheduledDate} at ${newScheduledTime}`;
      const defaultMessageNe = `यो पिकअप पुन: तालिका गरिएको छ। नयाँ समय: ${newScheduledDate} मा ${newScheduledTime}`;

      const newNotificationData = {
        wardId: originalData.wardId,
        wardNumber: originalData.wardNumber,
        scheduledDate: admin.firestore.Timestamp.fromDate(parsedDate),
        scheduledTime: newScheduledTime.toUpperCase(),
        messageText: messageText || defaultMessage,
        messageTextNe: messageTextNe || defaultMessageNe,
        status: "scheduled",
        createdBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        parentNotificationId: originalNotificationId,
        isRescheduled: true,
        rescheduleReason: reason || null,
        responseStats: {
          yesCount: 0,
          noCount: 0,
          totalCustomers: customerCount,
        },
      };

      // Use batch to update original and create new
      const batch = db.batch();

      // Mark original as cancelled/rescheduled
      batch.update(originalRef, {
        status: "cancelled",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        cancelledBy: context.auth.uid,
        rescheduledTo: newNotificationRef.id,
        cancellationReason: "Rescheduled",
      });

      // Create new notification
      batch.set(newNotificationRef, newNotificationData);

      await batch.commit();

      logger.info(
        `Pickup rescheduled: ${originalNotificationId} -> ${newNotificationRef.id}`
      );

      // Log to audit trail
      await db.collection("auditLogs").add({
        action: "PICKUP_RESCHEDULED",
        originalNotificationId: originalNotificationId,
        newNotificationId: newNotificationRef.id,
        wardNumber: originalData.wardNumber,
        reason: reason || "No reason provided",
        performedBy: context.auth.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        originalNotificationId: originalNotificationId,
        newNotificationId: newNotificationRef.id,
        wardNumber: originalData.wardNumber,
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      logger.error(`Error rescheduling pickup:`, error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to reschedule pickup"
      );
    }
  });
