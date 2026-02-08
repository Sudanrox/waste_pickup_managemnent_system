import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
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
import { getMockNotification, mockNotifications } from './mockData';

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
    } catch {
      // Fallback to mock data when Firebase is unavailable
      let filtered = mockNotifications;
      if (filters?.wardNumber) {
        filtered = filtered.filter((n) => n.wardNumber === filters.wardNumber);
      }
      if (filters?.status) {
        filtered = filtered.filter((n) => n.status === filters.status);
      }
      return filtered as unknown as PickupNotification[];
    }
  },

  // Get single notification by ID
  async getNotification(id: string): Promise<PickupNotification | null> {
    try {
      const docRef = doc(db, 'notifications', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Fallback to mock data
        return getMockNotification(id) as unknown as PickupNotification | null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as PickupNotification;
    } catch {
      // Fallback to mock data when Firebase is unavailable
      return getMockNotification(id) as unknown as PickupNotification | null;
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
    } catch {
      // No mock responses available
      return [];
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
