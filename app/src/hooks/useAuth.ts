import { useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userSnap = await get(ref(db, `users/${firebaseUser.uid}`));
          if (userSnap.exists()) {
            const data = userSnap.val() as Partial<UserProfile> & { createdAt?: number; updatedAt?: number };
            setState({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || data.email || '',
                displayName: firebaseUser.displayName || data.displayName || '',
                photoURL: firebaseUser.photoURL,
                initials: getInitials(firebaseUser.displayName || data.displayName || 'User'),
                theme: data.theme || 'dark',
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
              },
              firebaseUser,
              loading: false,
              error: null,
            });
          } else {
            // Create user doc if it doesn't exist
            const displayName = firebaseUser.displayName || 'User';
            const now = new Date();
            const userProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName,
              photoURL: firebaseUser.photoURL,
              initials: getInitials(displayName),
              theme: 'dark',
              createdAt: now,
              updatedAt: now,
            };
            await set(ref(db, `users/${firebaseUser.uid}`), {
              ...userProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setState({
              user: userProfile,
              firebaseUser,
              loading: false,
              error: null,
            });
          }
        } catch (err) {
          setState({
            user: null,
            firebaseUser,
            loading: false,
            error: 'Failed to load user profile',
          });
        }
      } else {
        setState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
        });
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      let message = 'Failed to sign in';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email';
      else if (error.code === 'auth/wrong-password') message = 'Incorrect password';
      else if (error.code === 'auth/invalid-credential') message = 'Invalid email or password';
      else if (error.code === 'auth/too-many-requests') message = 'Too many failed attempts. Please try again later';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await set(ref(db, `users/${result.user.uid}`), {
        uid: result.user.uid,
        email,
        displayName,
        photoURL: null,
        initials: getInitials(displayName),
        theme: 'dark',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await sendEmailVerification(result.user);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      let message = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') message = 'An account with this email already exists';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      else if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const error = err as { code?: string };
      let message = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email';
      throw new Error(message);
    }
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.displayName) {
      updates.displayName = data.displayName;
      updates.initials = getInitials(data.displayName);
      await updateProfile(currentUser, { displayName: data.displayName });
    }
    if (data.theme) {
      updates.theme = data.theme;
    }

    await update(ref(db, `users/${currentUser.uid}`), updates);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    await updatePassword(currentUser, newPassword);
  }, []);

  const resendVerification = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    await sendEmailVerification(currentUser);
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    resendVerification,
  };
}
