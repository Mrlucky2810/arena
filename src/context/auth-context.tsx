
"use client";

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment, onSnapshot, collection, query, where, getDocs, writeBatch, addDoc } from 'firebase/firestore';

type WalletType = 'inr' | 'crypto';

interface UserData {
    name: string;
    email: string;
    inrBalance: number;
    cryptoBalance: number;
    role?: 'user' | 'admin';
    status?: 'active' | 'blocked';
    referralCode?: string;
    referralEarnings?: number;
    referredBy?: string;
}

interface AuthResponse {
    success: boolean;
    message?: string;
    role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  inrBalance: number;
  cryptoBalance: number;
  updateBalance: (userId: string, amount: number, wallet: WalletType) => Promise<void>;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  register: (name: string, email: string, pass: string, referralCode?: string, role?: 'user' | 'admin') => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  adminExists: boolean;
  loadingAdminCheck: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inrBalance, setInrBalance] = useState(0);
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminExists = async () => {
        setLoadingAdminCheck(true);
        const adminMarkerRef = doc(db, "globals", "admin_user");
        try {
            const adminMarkerDoc = await getDoc(adminMarkerRef);
            setAdminExists(adminMarkerDoc.exists());
        } catch (error) {
            console.error("Error checking for admin:", error);
            setAdminExists(false); // Assume no admin if check fails
        } finally {
            setLoadingAdminCheck(false);
        }
    };
    checkAdminExists();
  }, []);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      let firestoreUnsubscribe: () => void = () => {};

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        
        firestoreUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const dbData = userDoc.data() as UserData;
                if (dbData.status === 'blocked') {
                  signOut(auth);
                  return;
                }
                setUser(user);
                setUserData(dbData);
                setInrBalance(dbData.inrBalance || 0);
                setCryptoBalance(dbData.cryptoBalance || 0);
            } else {
                signOut(auth);
            }
            setLoading(false);
        }, (error) => {
            console.error("Failed to listen to user document:", error);
            signOut(auth);
            setLoading(false);
        });

      } else {
        setUser(null);
        setUserData(null);
        setInrBalance(0);
        setCryptoBalance(0);
        setLoading(false);
      }

      return () => {
        firestoreUnsubscribe();
      };
    });

    return () => authUnsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        return { success: false, message: "User data not found." };
      }
      
      const dbData = userDoc.data() as UserData;
      if (dbData.status === 'blocked') {
        await signOut(auth);
        return { success: false, message: "Your account has been blocked. Please contact support." };
      }

      const role = dbData.role || 'user';
      return { success: true, role: role };
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, message: "Invalid email or password." };
      }
      return { success: false, message: "An unknown error occurred during login." };
    }
  };
  
  const register = async (name: string, email: string, pass: string, referralCode?: string, role: 'user' | 'admin' = 'user'): Promise<AuthResponse> => {
    try {
      const adminMarkerRef = doc(db, "globals", "admin_user");
      const adminMarkerDoc = await getDoc(adminMarkerRef);

      if (role === 'admin' && adminMarkerDoc.exists()) {
          return { success: false, message: "An admin account already exists." };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;
      
      let initialInrBalance = 0;
      let referrerDocRef = null;
      let referrerId: string | null = null;
      const referralReward = 150;

      if (referralCode) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('referralCode', '==', referralCode));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
              const referrerDoc = querySnapshot.docs[0];
              referrerDocRef = referrerDoc.ref;
              referrerId = referrerDoc.id;
              initialInrBalance = referralReward;
          }
      }

      const newUserDoc: UserData = {
        name: name,
        email: newUser.email!,
        inrBalance: initialInrBalance,
        cryptoBalance: 0,
        role: role,
        status: 'active',
        referralCode: generateReferralCode(),
        referralEarnings: 0,
        referredBy: referrerId,
      };

      const newUserDocRef = doc(db, "users", newUser.uid);
      const batch = writeBatch(db);
      
      batch.set(newUserDocRef, {
        ...newUserDoc,
        createdAt: serverTimestamp(),
      });

      if(referrerDocRef && referrerId) {
        batch.update(referrerDocRef, { 
            inrBalance: increment(referralReward),
            referralEarnings: increment(referralReward)
        });
        // Log the referral transaction
        const referralLogRef = doc(collection(db, "referrals"));
        batch.set(referralLogRef, {
            referrerId: referrerId,
            referredId: newUser.uid,
            amount: referralReward,
            createdAt: serverTimestamp(),
        });
      }

      if(role === 'admin') {
        batch.set(adminMarkerRef, { uid: newUser.uid, createdAt: serverTimestamp() });
      }

      await batch.commit();

      if(role === 'admin') {
        setAdminExists(true);
      }
      
      return { success: true, role };
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: "An account with this email already exists." };
        }
        console.error("Registration failed:", error);
        return { success: false, message: "An unknown error occurred during registration." };
    }
  }

  const logout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const updateBalance = async (userId: string, amount: number, wallet: WalletType) => {
    const userDocRef = doc(db, "users", userId);
    try {
        const balanceFieldToUpdate = wallet === 'inr' ? 'inrBalance' : 'cryptoBalance';
        
        await updateDoc(userDocRef, { [balanceFieldToUpdate]: increment(amount) });
    } catch (error) {
      console.error("Failed to update balance:", error);
      throw new Error("Failed to update balance. Please try again.");
    }
  };


  return (
    <AuthContext.Provider value={{ user, userData, login, register, logout, loading, inrBalance, cryptoBalance, updateBalance, adminExists, loadingAdminCheck }}>
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
