/**
 * onNotificationCreate
 *
 * Triggered when admin creates a new pickup notification.
 * - Sends FCM push notification to the ward topic
 * - Updates notification status to 'sent'
 * - Records sentAt timestamp
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();
const messaging = admin.messaging();

interface NotificationData {
  wardId: string;
  wardNumber: number;
  scheduledDate: admin.firestore.Timestamp;
  scheduledTime: string;
  messageText: string;
  messageTextNe: string;
  status: string;
  createdBy: string;
}

export const onNotificationCreate = functions
  .region("asia-south1")
  .firestore.document("notifications/{notificationId}")
  .onCreate(async (snapshot, context) => {
    const notificationId = context.params.notificationId;
    const data = snapshot.data() as NotificationData;

    logger.info(`New notification created: ${notificationId} for ward ${data.wardNumber}`);

    // Only send push if status is 'scheduled'
    if (data.status !== "scheduled") {
      logger.info(`Notification ${notificationId} status is ${data.status}, not sending push`);
      return null;
    }

    const topic = `ward_${data.wardNumber}`;
    const scheduledDate = data.scheduledDate.toDate();

    // Format date for display
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = scheduledDate.toLocaleDateString("en-US", dateOptions);

    try {
      // Prepare FCM message
      const message: admin.messaging.Message = {
        topic: topic,
        notification: {
          title: "Waste Pickup Scheduled",
          body: `Pickup for Ward ${data.wardNumber} on ${formattedDate} at ${data.scheduledTime}`,
        },
        data: {
          notificationId: notificationId,
          wardNumber: String(data.wardNumber),
          scheduledDate: scheduledDate.toISOString(),
          scheduledTime: data.scheduledTime,
          type: "pickup_scheduled",
          click_action: "OPEN_NOTIFICATION_DETAIL",
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              alert: {
                title: "Waste Pickup Scheduled",
                body: `Pickup for Ward ${data.wardNumber} on ${formattedDate} at ${data.scheduledTime}`,
              },
              badge: 1,
              sound: "default",
              "mutable-content": 1,
              "content-available": 1,
            },
          },
        },
        android: {
          priority: "high",
          notification: {
            channelId: "pickup_notifications",
            priority: "high",
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
      };

      // Send FCM message to topic
      const response = await messaging.send(message);
      logger.info(`FCM sent successfully: ${response} to topic ${topic}`);

      // Get customer count for the ward
      const wardDoc = await db.collection("wards").doc(data.wardId).get();
      const customerCount = wardDoc.exists
        ? wardDoc.data()?.customerCount || 0
        : 0;

      // Update notification status to 'sent'
      await snapshot.ref.update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        "responseStats.totalCustomers": customerCount,
        fcmMessageId: response,
      });

      logger.info(
        `Notification ${notificationId} marked as sent. Target customers: ${customerCount}`
      );

      return {
        success: true,
        notificationId,
        fcmMessageId: response,
        topic,
        customerCount,
      };
    } catch (error) {
      logger.error(`Error sending FCM for notification ${notificationId}:`, error);

      // Update notification with error status
      await snapshot.ref.update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw new functions.https.HttpsError(
        "internal",
        "Failed to send push notification"
      );
    }
  });
