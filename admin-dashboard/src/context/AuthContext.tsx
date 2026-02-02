import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthUser, Admin } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  admin: Admin | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get custom claims for role
        const tokenResult = await firebaseUser.getIdTokenResult();
        const role = tokenResult.claims.role as 'admin' | 'super_admin' | undefined;

        // Check if user is admin
        if (!role || (role !== 'admin' && role !== 'super_admin')) {
          await firebaseSignOut(auth);
          setUser(null);
          setAdmin(null);
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Set auth user
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role,
        });

        // Fetch admin document
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            setAdmin({
              id: adminDoc.id,
              ...adminDoc.data(),
            } as Admin);
          }
        } catch (err) {
          console.error('Error fetching admin data:', err);
        }
      } else {
        setUser(null);
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Verify admin role
      const tokenResult = await result.user.getIdTokenResult();
      const role = tokenResult.claims.role;

      if (!role || (role !== 'admin' && role !== 'super_admin')) {
        await firebaseSignOut(auth);
        throw new Error('Access denied. Admin privileges required.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setAdmin(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        error,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
