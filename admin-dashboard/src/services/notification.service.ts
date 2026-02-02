import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import {
  PickupNotification,
  PickupResponse,
  CreateNotificationInput,
  RescheduleInput,
  FilterParams,
} from '../types';

export const notificationService = {
  // Get all notifications with optional filters
  async getNotifications(filters?: FilterParams): Promise<PickupNotification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      let q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(100));

      if (filters?.wardNumber) {
        q = query(
          notificationsRef,
          where('wardNumber', '==', filters.wardNumber),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }

      if (filters?.status) {
        q = query(
          notificationsRef,
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PickupNotification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get single notification by ID
  async getNotification(id: string): Promise<PickupNotification | null> {
    try {
      const docRef = doc(db, 'notifications', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as PickupNotification;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  // Get responses for a notification
  async getResponses(notificationId: string): Promise<PickupResponse[]> {
    try {
      const responsesRef = collection(db, 'responses');
      const q = query(
        responsesRef,
        where('notificationId', '==', notificationId),
        orderBy('respondedAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PickupResponse[];
    } catch (error) {
      console.error('Error fetching responses:', error);
      throw error;
    }
  },

  // Create new notification
  async createNotification(input: CreateNotificationInput): Promise<{ notificationId: string }> {
    try {
      const createNotification = httpsCallable(functions, 'createNotification');
      const result = await createNotification(input);
      return result.data as { notificationId: string };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Reschedule pickup
  async reschedulePickup(input: RescheduleInput): Promise<{ newNotificationId: string }> {
    try {
      const reschedulePickup = httpsCallable(functions, 'reschedulePickup');
      const result = await reschedulePickup(input);
      return result.data as { newNotificationId: string };
    } catch (error) {
      console.error('Error rescheduling pickup:', error);
      throw error;
    }
  },
};
