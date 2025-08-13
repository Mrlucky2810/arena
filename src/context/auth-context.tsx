
"use client";

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment, onSnapshot } from 'firebase/firestore';

interface UserData {
    name: string;
    email: string;
    balance: number;
    role?: 'user' | 'admin';
}

interface AuthResponse {
    success: boolean;
    message?: string;
    role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  balance: number;
  updateBalance: (userId: string, amount: number, operation?: 'add' | 'subtract') => Promise<void>;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  register: (name: string, email: string, pass: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      let firestoreUnsubscribe: () => void = () => {};

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        
        firestoreUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const dbData = userDoc.data() as UserData;
                setUser(user);
                setUserData(dbData);
                setBalance(dbData.balance);
            } else {
                // User exists in Auth but not Firestore. This is an inconsistent state.
                // Silently sign them out.
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
        setBalance(0);
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

      const role = userDoc.data()?.role || 'user';
      return { success: true, role: role };
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, message: "Invalid email or password." };
      }
      return { success: false, message: "An unknown error occurred during login." };
    }
  };
  
  const register = async (name: string, email: string, pass: string): Promise<AuthResponse> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const initialBalance = 0;
      // The first registered user becomes an admin. This can be changed later in the database.
      const adminMarkerRef = doc(db, "globals", "admin_user");
      const adminMarkerDoc = await getDoc(adminMarkerRef);
      const userRole = !adminMarkerDoc.exists() ? "admin" : "user";


      const newUser: UserData = {
        name: name,
        email: user.email!,
        balance: initialBalance,
        role: userRole,
      };

      await setDoc(doc(db, "users", user.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
      });

      if(userRole === 'admin') {
        await setDoc(adminMarkerRef, { uid: user.uid });
      }
      
      // No need to set state here, the onSnapshot listener will handle it.
      return { success: true, role: userRole };
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
    router.push('/login');
  };

  const updateBalance = async (userId: string, amount: number, operation: 'add' | 'subtract' = 'add') => {
    const userDocRef = doc(db, "users", userId);
    try {
      const change = operation === 'add' ? amount : -amount;
      await updateDoc(userDocRef, { balance: increment(change) });
      
      // No need to update state manually, onSnapshot will handle it.

    } catch (error) {
      console.error("Failed to update balance:", error);
      throw new Error("Failed to update balance. Please try again.");
    }
  };


  return (
    <AuthContext.Provider value={{ user, userData, login, register, logout, loading, balance, updateBalance }}>
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
