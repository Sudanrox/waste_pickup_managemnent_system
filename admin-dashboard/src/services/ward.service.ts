import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { Ward, WardStats } from '../types';
import { mockWards } from './mockData';

export const wardService = {
  // Get all wards
  async getWards(): Promise<Ward[]> {
    try {
      const wardsRef = collection(db, 'wards');
      const q = query(wardsRef, orderBy('wardNumber', 'asc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // No data in Firebase, return mock data
        return mockWards as unknown as Ward[];
      }

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ward[];
    } catch {
      // Firebase unavailable, return mock data
      console.log('Firebase unavailable, using mock ward data');
      return mockWards as unknown as Ward[];
    }
  },

  // Get single ward by number
  async getWard(wardNumber: number): Promise<Ward | null> {
    try {
      const docRef = doc(db, 'wards', `ward_${wardNumber}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Return from mock data
        const mockWard = mockWards.find(w => w.wardNumber === wardNumber);
        return mockWard as unknown as Ward | null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Ward;
    } catch {
      // Firebase unavailable, return from mock data
      const mockWard = mockWards.find(w => w.wardNumber === wardNumber);
      return mockWard as unknown as Ward | null;
    }
  },

  // Get ward statistics
  async getWardStats(): Promise<WardStats[]> {
    try {
      const getWardStats = httpsCallable(functions, 'getWardStats');
      const result = await getWardStats({});
      const data = result.data as { wards: WardStats[] };
      return data.wards;
    } catch {
      // Firebase unavailable, generate stats from mock data
      return mockWards.map(w => ({
        id: w.id,
        wardNumber: w.wardNumber,
        name: w.name,
        nameNe: w.nameNe,
        customerCount: w.customerCount,
        isActive: w.isActive,
        recentNotifications: Math.floor(Math.random() * 10) + 1,
        responseRate: w.responseRate,
        averageResponseRate: w.responseRate,
        lastPickupDate: w.lastPickupDate,
      })) as WardStats[];
    }
  },
};
