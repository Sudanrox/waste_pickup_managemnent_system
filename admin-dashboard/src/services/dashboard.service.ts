import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { DashboardStats, RecentNotification, PickupNotification } from '../types';

export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    try {
      // Call Cloud Function for aggregated stats
      const getWardStats = httpsCallable(functions, 'getWardStats');
      const result = await getWardStats({});
      const data = result.data as {
        summary: {
          totalCustomers: number;
          totalWards: number;
          activeWards: number;
          overallResponseRate: number;
        };
      };

      // Get today's notifications count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const notificationsRef = collection(db, 'notifications');
      const todayQuery = query(
        notificationsRef,
        where('scheduledDate', '>=', Timestamp.fromDate(today)),
        where('scheduledDate', '<', Timestamp.fromDate(new Date(today.getTime() + 86400000)))
      );

      const todaySnapshot = await getDocs(todayQuery);

      // Get pending notifications count
      const pendingQuery = query(
        notificationsRef,
        where('status', '==', 'scheduled')
      );
      const pendingSnapshot = await getDocs(pendingQuery);

      // Get total notifications
      const allNotificationsSnapshot = await getDocs(notificationsRef);

      return {
        totalCustomers: data.summary.totalCustomers,
        totalWards: data.summary.totalWards,
        activeWards: data.summary.activeWards,
        totalNotifications: allNotificationsSnapshot.size,
        pendingNotifications: pendingSnapshot.size,
        todayPickups: todaySnapshot.size,
        overallResponseRate: data.summary.overallResponseRate,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        totalCustomers: 0,
        totalWards: 32,
        activeWards: 0,
        totalNotifications: 0,
        pendingNotifications: 0,
        todayPickups: 0,
        overallResponseRate: 0,
      };
    }
  },

  // Get recent notifications
  async getRecentNotifications(count: number = 5): Promise<RecentNotification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const recentQuery = query(
        notificationsRef,
        orderBy('createdAt', 'desc'),
        limit(count)
      );

      const snapshot = await getDocs(recentQuery);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as PickupNotification;
        return {
          id: doc.id,
          wardNumber: data.wardNumber,
          scheduledDate: data.scheduledDate.toDate().toISOString(),
          status: data.status,
          yesCount: data.responseStats?.yesCount || 0,
          noCount: data.responseStats?.noCount || 0,
        };
      });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      return [];
    }
  },
};
