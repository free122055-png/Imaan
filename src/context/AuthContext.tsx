import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, query, collection, where, getDocs, limit } from 'firebase/firestore';
import { auth, db, isRealFirebaseConfigured } from '../firebase/config';
import { User, UserAddress } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; code?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  saveAddress: (address: Omit<UserAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'aiman_brand_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Sync session with Firestore users/{uid}
  const syncUserWithFirestore = async (fbUser: FirebaseUser): Promise<User> => {
    const uid = fbUser.uid;
    const email = fbUser.email || '';
    const displayName = fbUser.displayName || email.split('@')[0] || 'Customer';
    const now = new Date().toISOString();

    let userDocData: Partial<User> | null = null;

    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        let userSnap = await getDoc(userRef);

        // If UID document doesn't exist, check if there's a document with the same email
        if (!userSnap.exists() && email) {
          const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const existingDoc = querySnap.docs[0];
            const existingData = existingDoc.data() as Partial<User>;
            
            // If the document has a different UID, we "claim" it for the new UID
            // This happens when a user registers with email then logs in with Google (different UIDs)
            userDocData = existingData;
            
            // Update the existing document with the new UID and latest info
            await updateDoc(existingDoc.ref, {
              uid: uid,
              id: uid, // Update id too if it matches uid
              updatedAt: now,
              lastLoginAt: serverTimestamp(),
              photoURL: fbUser.photoURL || existingData.photoURL || '',
            }).catch(() => {});
            
            // Optionally, if the ID was different (e.g. old random ID), we might want to keep using the same document ref
            // but for simplicity, we are updating the content of the document found by email.
          }
        }

        if (userSnap.exists()) {
          userDocData = userSnap.data() as Partial<User>;
          await updateDoc(userRef, {
            updatedAt: now,
            lastLoginAt: serverTimestamp(),
          }).catch(() => {});
        } else if (!userDocData) {
          // New user document: Default to 'customer'
          const newDoc = {
            id: uid,
            uid: uid,
            displayName: displayName,
            email: email,
            phone: fbUser.phoneNumber || '',
            role: 'customer',
            provider: fbUser.providerData[0]?.providerId || 'google.com',
            photoURL: fbUser.photoURL || '',
            wishlist: [],
            addresses: [],
            createdAt: now,
            updatedAt: now,
            lastLoginAt: serverTimestamp(),
          };
          await setDoc(userRef, newDoc).catch(() => {});
          userDocData = newDoc as unknown as Partial<User>;
        }
      } catch (err) {
        console.warn('Firestore user sync note:', err);
      }
    }

    const mergedUser: User = {
      id: uid,
      uid: uid,
      displayName: userDocData?.displayName || displayName,
      email: email,
      phone: userDocData?.phone || fbUser.phoneNumber || '',
      role: (userDocData?.role as User['role']) || 'customer',
      wishlist: userDocData?.wishlist || [],
      addresses: userDocData?.addresses || [],
      createdAt: userDocData?.createdAt || now,
      updatedAt: now,
    };

    return mergedUser;
  };

  // Listen to real Firebase Auth state changes & Handle Redirect Result
  useEffect(() => {
    if (!auth) return;

    // Check for redirect result when returning from Google OAuth
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const synced = await syncUserWithFirestore(result.user);
          setCurrentUser(synced);
          setFirebaseUser(result.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(synced));
        }
      })
      .catch((err) => {
        console.warn('Firebase redirect sign-in check:', err?.code, err?.message);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const synced = await syncUserWithFirestore(user);
          setCurrentUser(synced);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(synced));
        } catch (e) {
          console.error('Failed to sync authenticated user:', e);
        }
      } else {
        if (isRealFirebaseConfigured) {
          setCurrentUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Auth storage sync error:', e);
    }
  }, [currentUser]);

  // Real Google Sign In via Firebase Authentication
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; code?: string }> => {
    if (!auth) {
      return {
        success: false,
        error: 'Firebase Auth প্রস্তুত নয়। Firebase কনফিগারেশন চেক করুন।',
        code: 'auth/not-initialized'
      };
    }

    // Check if the current page is embedded inside an iframe (like AI Studio preview pane)
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      return {
        success: false,
        code: 'auth/iframe-blocked',
        error: 'Google সুরক্ষা নীতির কারণে এডিটরের ভেতরের প্রিভিউ ফ্রেমে Google Sign-in কাজ করে না। অনুগ্রহ করে ওপরে ডানে "Open in new tab" (↗) বাটনে ক্লিক করে নতুন ট্যাবে সাইটটি খুলুন।'
      };
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      // Use popup by default on all devices (mobile and desktop)
      // Popups avoid full-page redirect inside restricted webview frames
      const result = await signInWithPopup(auth, provider);
      if (result && result.user) {
        const synced = await syncUserWithFirestore(result.user);
        setCurrentUser(synced);
        setFirebaseUser(result.user);
        return { success: true };
      }
      return { success: false, error: 'লগইন সম্পন্ন হয়নি।' };
    } catch (popupErr: any) {
      const code = popupErr?.code || '';

      // User closed the popup window deliberately
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return { success: false, code };
      }

      if (code === 'auth/unauthorized-domain') {
        return {
          success: false,
          code,
          error: `এই ডোমেইন (${window.location.hostname}) Firebase Authentication-এর Authorized Domains তালিকায় যুক্ত করা নেই।`
        };
      }

      // If popup is blocked by browser, try redirect as fallback
      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirErr: any) {
          return {
            success: false,
            code: redirErr?.code,
            error: 'ব্রাউজার পপআপ ও রিডাইরেক্ট দুটোই ব্লক করেছে। ব্রাউজারের পপআপ পারমিশন অন করুন।'
          };
        }
      }

      console.error('Google Sign-In Error:', popupErr);
      return {
        success: false,
        code,
        error: popupErr.message || 'গুগল লগইন ব্যর্থ হয়েছে।'
      };
    }
  };

  // Email / Password Login
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase Auth উপলব্ধ নয়।' };
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const synced = await syncUserWithFirestore(cred.user);
      setCurrentUser(synced);
      setFirebaseUser(cred.user);
      return { success: true };
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      let msg = 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।';
      if (err.code === 'auth/user-not-found') msg = 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।';
      if (err.code === 'auth/wrong-password') msg = 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।';
      if (err.code === 'auth/invalid-email') msg = 'ইমেইল অ্যাড্রেস সঠিক নয়।';
      return { success: false, error: msg };
    }
  };

  // Email / Password Registration
  const registerWithEmail = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase Auth উপলব্ধ নয়।' };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const synced = await syncUserWithFirestore({
        ...cred.user,
        displayName: name.trim() || cred.user.displayName,
      } as FirebaseUser);
      setCurrentUser(synced);
      setFirebaseUser(cred.user);
      return { success: true };
    } catch (err: any) {
      console.error('Email registration error:', err);
      let msg = 'রেজিস্ট্রেশন করা সম্ভব হয়নি।';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।';
      }
      if (err.code === 'auth/weak-password') {
        msg = 'পাসওয়ার্ড অত্যন্ত দুর্বল। কমপক্ষে ৬টি অক্ষর বা সংখ্যা দিন।';
      }
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updated);

    if (db && currentUser.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Failed to update user profile in Firestore:', e);
      }
    }
  };

  const toggleWishlist = (productId: string) => {
    if (!currentUser) return;
    const currentList = currentUser.wishlist || [];
    const exists = currentList.includes(productId);
    const updatedList = exists ? currentList.filter(id => id !== productId) : [...currentList, productId];
    updateProfile({ wishlist: updatedList });
  };

  const isInWishlist = (productId: string): boolean => {
    return currentUser?.wishlist?.includes(productId) || false;
  };

  const saveAddress = (address: Omit<UserAddress, 'id'>) => {
    if (!currentUser) return;
    const currentAddresses = currentUser.addresses || [];
    const newAddr: UserAddress = {
      ...address,
      id: 'addr-' + Date.now(),
    };

    if (newAddr.isDefault) {
      currentAddresses.forEach(a => (a.isDefault = false));
    }
    const updatedAddresses = [...currentAddresses, newAddr];
    updateProfile({ addresses: updatedAddresses });
  };

  const deleteAddress = (id: string) => {
    if (!currentUser || !currentUser.addresses) return;
    const updated = currentUser.addresses.filter(a => a.id !== id);
    updateProfile({ addresses: updated });
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isManager = currentUser?.role === 'manager';
  const isStaff = currentUser?.role === 'staff';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin || isManager || isStaff;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated: !!currentUser,
        isAdmin,
        isSuperAdmin,
        isManager,
        isStaff,
        isConfigured: isRealFirebaseConfigured,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateProfile,
        toggleWishlist,
        isInWishlist,
        saveAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
