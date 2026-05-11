import { clearSession, saveSession } from '@/platform/storage/sessionStorage';
import { auth } from '@/services/firebase';
import { User, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface UseAuthReturn {
  currentUser: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

/**
 * Hook for managing Firebase authentication state
 * Handles auth initialization, loading, logout, and session persistence
 */
export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);
        
        // Save session when user logs in
        if (user) {
          await saveSession({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            lastLogin: new Date().toISOString()
          });
        }
        
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      await clearSession();
      setCurrentUser(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    error,
    signOut
  };
}
