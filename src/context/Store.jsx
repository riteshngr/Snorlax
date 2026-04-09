/**
 * Store.jsx — Global state provider for Auth and UserData.
 *
 * Provides two contexts:
 *   1. AuthContext  — current Firebase user, loading state, auth actions
 *   2. UserDataContext — user profile (credits, gems, username), inventory
 *
 * Usage:
 *   const { user, loading } = useAuth();
 *   const { profile, inventory, refreshInventory } = useUserData();
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthChange, logoutUser } from "../services/auth";
import {
  onUserProfile,
  onUserInventory,
  updateUserCredits,
  addCardsToInventory as dbAddCardsToInventory,
  removeCardFromInventory as dbRemoveCardFromInventory,
} from "../services/db";

// ─── Auth Context ────────────────────────────────────────────

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within StoreProvider");
  return ctx;
}

// ─── UserData Context ────────────────────────────────────────

const UserDataContext = createContext(null);

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within StoreProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────

export default function StoreProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User data state
  const [profile, setProfile] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (!firebaseUser) {
        // User signed out — clear data
        setProfile(null);
        setInventory([]);
        setDataLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to user profile + inventory when user changes
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    let profileLoaded = false;
    let inventoryLoaded = false;

    const checkLoaded = () => {
      if (profileLoaded && inventoryLoaded) {
        setDataLoading(false);
      }
    };

    // Real-time profile listener
    const unsubProfile = onUserProfile(user.uid, (data) => {
      setProfile(data);
      profileLoaded = true;
      checkLoaded();
    });

    // Real-time inventory listener
    const unsubInventory = onUserInventory(user.uid, (data) => {
      setInventory(data);
      inventoryLoaded = true;
      checkLoaded();
    });

    return () => {
      unsubProfile();
      unsubInventory();
    };
  }, [user]);

  // ── Actions ──

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  const addCardsToInventory = useCallback(
    async (cards) => {
      if (!user) return;
      await dbAddCardsToInventory(user.uid, cards);
      // Inventory will auto-update via onSnapshot listener
    },
    [user]
  );

  const removeCardFromInventory = useCallback(
    async (cardDocId) => {
      if (!user) return;
      await dbRemoveCardFromInventory(user.uid, cardDocId);
    },
    [user]
  );

  const spendCredits = useCallback(
    async (amount) => {
      if (!user || !profile) return false;
      if (profile.credits < amount) return false;
      await updateUserCredits(user.uid, -amount);
      return true;
    },
    [user, profile]
  );

  const earnCredits = useCallback(
    async (amount) => {
      if (!user) return;
      await updateUserCredits(user.uid, amount);
    },
    [user]
  );

  // ── Auth context value ──
  const authValue = {
    user,
    loading: authLoading,
    logout: handleLogout,
  };

  // ── User data context value ──
  const userDataValue = {
    profile,
    inventory,
    loading: dataLoading,
    addCardsToInventory,
    removeCardFromInventory,
    spendCredits,
    earnCredits,
  };

  return (
    <AuthContext.Provider value={authValue}>
      <UserDataContext.Provider value={userDataValue}>
        {children}
      </UserDataContext.Provider>
    </AuthContext.Provider>
  );
}
