/**
 * onNotificationUpdate
 *
 * Triggered when a notification is updated.
 * Handles:
 * - Cancellation notifications
 * - Rescheduling notifications
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const messaging = admin.messaging();

interface NotificationData {
  wardId: string;
  wardNumber: number;
  scheduledDate: admin.firestore.Timestamp;
  scheduledTime: string;
  messageText: string;
  messageTextNe: string;
  status: string;
  isRescheduled: boolean;
}

export const onNotificationUpdate = functions
  .region("asia-south1")
  .firestore.document("notifications/{notificationId}")
  .onUpdate(async (change, context) => {
    const notificationId = context.params.notificationId;
    const beforeData = change.before.data() as NotificationData;
    const afterData = change.after.data() as NotificationData;

    // Check if status changed to 'cancelled'
    if (beforeData.status !== "cancelled" && afterData.status === "cancelled") {
      logger.info(`Notification ${notificationId} was cancelled`);

      const topic = `ward_${afterData.wardNumber}`;

      try {
        // Send cancellation push notification
        const message: admin.messaging.Message = {
          topic: topic,
          notification: {
            title: "Pickup Cancelled",
            body: `The scheduled pickup for Ward ${afterData.wardNumber} has been cancelled.`,
          },
          data: {
            notificationId: notificationId,
            wardNumber: String(afterData.wardNumber),
            type: "pickup_cancelled",
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: "Pickup Cancelled",
                  body: `The scheduled pickup for Ward ${afterData.wardNumber} has been cancelled.`,
                },
                badge: 1,
                sound: "default",
              },
            },
          },
        };

        const response = await messaging.send(message);
        logger.info(`Cancellation FCM sent: ${response}`);

        return { success: true, type: "cancellation" };
      } catch (error) {
        logger.error(`Error sending cancellation FCM:`, error);
        throw error;
      }
    }

    // Check if this is a reschedule (status changed back to 'sent' with isRescheduled flag)
    if (
      afterData.isRescheduled &&
      !beforeData.isRescheduled &&
      afterData.status === "sent"
    ) {
      logger.info(`Notification ${notificationId} was rescheduled`);

      const topic = `ward_${afterData.wardNumber}`;
      const scheduledDate = afterData.scheduledDate.toDate();
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      const formattedDate = scheduledDate.toLocaleDateString("en-US", dateOptions);

      try {
        // Send reschedule push notification
        const message: admin.messaging.Message = {
          topic: topic,
          notification: {
            title: "Pickup Rescheduled",
            body: `Ward ${afterData.wardNumber} pickup rescheduled to ${formattedDate} at ${afterData.scheduledTime}`,
          },
          data: {
            notificationId: notificationId,
            wardNumber: String(afterData.wardNumber),
            scheduledDate: scheduledDate.toISOString(),
            scheduledTime: afterData.scheduledTime,
            type: "pickup_rescheduled",
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: "Pickup Rescheduled",
                  body: `Ward ${afterData.wardNumber} pickup rescheduled to ${formattedDate} at ${afterData.scheduledTime}`,
                },
                badge: 1,
                sound: "default",
              },
            },
          },
        };

        const response = await messaging.send(message);
        logger.info(`Reschedule FCM sent: ${response}`);

        return { success: true, type: "reschedule" };
      } catch (error) {
        logger.error(`Error sending reschedule FCM:`, error);
        throw error;
      }
    }

    logger.debug(`Notification ${notificationId} updated, no FCM action needed`);
    return null;
  });
