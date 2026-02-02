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

export const wardService = {
  // Get all wards
  async getWards(): Promise<Ward[]> {
    try {
      const wardsRef = collection(db, 'wards');
      const q = query(wardsRef, orderBy('wardNumber', 'asc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ward[];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  },

  // Get single ward by number
  async getWard(wardNumber: number): Promise<Ward | null> {
    try {
      const docRef = doc(db, 'wards', `ward_${wardNumber}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Ward;
    } catch (error) {
      console.error('Error fetching ward:', error);
      throw error;
    }
  },

  // Get ward statistics
  async getWardStats(): Promise<WardStats[]> {
    try {
      const getWardStats = httpsCallable(functions, 'getWardStats');
      const result = await getWardStats({});
      const data = result.data as { wards: WardStats[] };
      return data.wards;
    } catch (error) {
      console.error('Error fetching ward stats:', error);
      throw error;
    }
  },
};
