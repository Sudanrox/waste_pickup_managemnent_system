/**
 * getWardStats
 *
 * Callable function for admins to get ward statistics.
 * Returns customer counts, response rates, etc.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const logger = functions.logger;
const db = admin.firestore();

interface GetWardStatsData {
  wardNumber?: number; // Optional - if not provided, returns all wards
}

interface WardStats {
  wardNumber: number;
  wardId: string;
  name: string;
  nameNe: string;
  customerCount: number;
  recentNotifications: number;
  averageResponseRate: number;
  lastPickupDate: string | null;
}

export const getWardStats = functions
  .region("asia-south1")
  .https.onCall(async (data: GetWardStatsData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated"
      );
    }

    // Verify admin role
    const role = context.auth.token.role;
    if (role !== "admin" && role !== "super_admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can view ward statistics"
      );
    }

    const { wardNumber } = data;

    logger.info(
      `Admin ${context.auth.uid} requesting ward stats${wardNumber ? ` for ward ${wardNumber}` : ""}`
    );

    try {
      if (wardNumber) {
        // Get stats for specific ward
        const stats = await getStatsForWard(wardNumber);
        return { success: true, data: stats };
      } else {
        // Get stats for all wards
        const allStats = await getAllWardStats();
        return { success: true, data: allStats };
      }
    } catch (error) {
      logger.error(`Error getting ward stats:`, error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get ward statistics"
      );
    }
  });

async function getStatsForWard(wardNumber: number): Promise<WardStats> {
  const wardId = `ward_${wardNumber}`;

  // Get ward document
  const wardDoc = await db.collection("wards").doc(wardId).get();

  if (!wardDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `Ward ${wardNumber} not found`
    );
  }

  const wardData = wardDoc.data()!;

  // Get recent notifications (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const notificationsSnapshot = await db
    .collection("notifications")
    .where("wardNumber", "==", wardNumber)
    .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
    .get();

  // Calculate average response rate
  let totalResponseRate = 0;
  let notificationCount = 0;
  let lastPickupDate: Date | null = null;

  for (const doc of notificationsSnapshot.docs) {
    const data = doc.data();
    const stats = data.responseStats;

    if (stats && stats.totalCustomers > 0) {
      const responseRate =
        ((stats.yesCount + stats.noCount) / stats.totalCustomers) * 100;
      totalResponseRate += responseRate;
      notificationCount++;
    }

    // Track last pickup
    if (data.scheduledDate) {
      const schedDate = data.scheduledDate.toDate() as Date;
      if (!lastPickupDate || schedDate > lastPickupDate) {
        lastPickupDate = schedDate;
      }
    }
  }

  const averageResponseRate =
    notificationCount > 0 ? totalResponseRate / notificationCount : 0;

  const lastPickupStr = lastPickupDate
    ? (lastPickupDate as Date).toISOString().split("T")[0]
    : null;

  return {
    wardNumber: wardNumber,
    wardId: wardId,
    name: wardData.name,
    nameNe: wardData.nameNe,
    customerCount: wardData.customerCount || 0,
    recentNotifications: notificationsSnapshot.size,
    averageResponseRate: Math.round(averageResponseRate * 10) / 10,
    lastPickupDate: lastPickupStr,
  };
}

async function getAllWardStats(): Promise<{
  wards: WardStats[];
  summary: {
    totalCustomers: number;
    totalWards: number;
    activeWards: number;
    overallResponseRate: number;
  };
}> {
  // Get all wards
  const wardsSnapshot = await db
    .collection("wards")
    .orderBy("wardNumber", "asc")
    .get();

  const wardStats: WardStats[] = [];
  let totalCustomers = 0;
  let activeWards = 0;

  for (const wardDoc of wardsSnapshot.docs) {
    const wardData = wardDoc.data();
    const wardNumber = wardData.wardNumber;

    // Get recent notifications for this ward
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const notificationsSnapshot = await db
      .collection("notifications")
      .where("wardNumber", "==", wardNumber)
      .where(
        "createdAt",
        ">=",
        admin.firestore.Timestamp.fromDate(thirtyDaysAgo)
      )
      .limit(10)
      .get();

    // Calculate response rate
    let totalResponseRate = 0;
    let notificationCount = 0;
    let lastPickupDate: Date | null = null;

    for (const doc of notificationsSnapshot.docs) {
      const data = doc.data();
      const statsData = data.responseStats;

      if (statsData && statsData.totalCustomers > 0) {
        const responseRate =
          ((statsData.yesCount + statsData.noCount) / statsData.totalCustomers) * 100;
        totalResponseRate += responseRate;
        notificationCount++;
      }

      if (data.scheduledDate) {
        const schedDate = data.scheduledDate.toDate() as Date;
        if (!lastPickupDate || schedDate > lastPickupDate) {
          lastPickupDate = schedDate;
        }
      }
    }

    const averageResponseRate =
      notificationCount > 0 ? totalResponseRate / notificationCount : 0;

    const lastPickupStr = lastPickupDate
      ? (lastPickupDate as Date).toISOString().split("T")[0]
      : null;

    const stats: WardStats = {
      wardNumber: wardNumber,
      wardId: wardDoc.id,
      name: wardData.name,
      nameNe: wardData.nameNe,
      customerCount: wardData.customerCount || 0,
      recentNotifications: notificationsSnapshot.size,
      averageResponseRate: Math.round(averageResponseRate * 10) / 10,
      lastPickupDate: lastPickupStr,
    };

    wardStats.push(stats);
    totalCustomers += stats.customerCount;

    if (stats.customerCount > 0) {
      activeWards++;
    }
  }

  // Calculate overall response rate
  const totalResponseRate = wardStats.reduce(
    (sum, ward) => sum + ward.averageResponseRate,
    0
  );
  const overallResponseRate =
    wardStats.length > 0 ? totalResponseRate / wardStats.length : 0;

  return {
    wards: wardStats,
    summary: {
      totalCustomers,
      totalWards: wardsSnapshot.size,
      activeWards,
      overallResponseRate: Math.round(overallResponseRate * 10) / 10,
    },
  };
}
