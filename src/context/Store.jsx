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
  onShopState,
  updateShopStock,
  buyStoneTransaction,
  updateUserCredits,
  updateUserStones,
  addCardsToInventory as dbAddCardsToInventory,
  removeCardFromInventory as dbRemoveCardFromInventory,
  sellCardTransaction,
  bulkSellCardsTransaction,
} from "../services/db";
import { fetchPokemonById } from "../services/pokemon";
import { generateCard } from "../utils/cardGenerator";
import { generateShopStock, RESTOCK_INTERVAL_MS } from "../services/shop";
import { useRef } from "react";

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

const SELL_PRICES = {
  Common: 30,
  Uncommon: 50,
  Rare: 120,
  Epic: 250,
  Legendary: 600,
  Mythical: 2000,
  Ultra: 2500, // Kept higher for special ultra cards
};

// ─── Provider ────────────────────────────────────────────────

export default function StoreProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User data state
  const [profile, setProfile] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [shop, setShop] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const restockTriggeredRef = useRef(false);

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

  // Listen to global shop state
  useEffect(() => {
    const unsubscribe = onShopState(async (shopData) => {
      if (!shopData || !shopData.stock) {
        const initialStock = generateShopStock();
        await updateShopStock(initialStock);
        return;
      }
      setShop(shopData);
      
      // Reset the local "triggered" lock whenever the shop state changes from the server
      restockTriggeredRef.current = false;
    });

    return () => unsubscribe();
  }, []);

  // Background Restock Ticker (Runs every second)
  useEffect(() => {
    const ticker = setInterval(async () => {
      if (!shop || !shop.lastRestockTime) return;

      const lastRestock = shop.lastRestockTime?.toMillis() || 0;
      const now = Date.now();
      
      if (now - lastRestock >= RESTOCK_INTERVAL_MS && !restockTriggeredRef.current) {
        console.log("Automatic restock triggered...");
        restockTriggeredRef.current = true; // Lock it locally
        
        try {
          const newStock = generateShopStock();
          await updateShopStock(newStock);
        } catch (err) {
          console.error("Auto restock failed:", err);
          restockTriggeredRef.current = false; // Release lock on error
        }
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, [shop]);

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

  const evolvePokemon = useCallback(
    async (stoneId, fromPokemonDocId, toPokemonId) => {
      if (!user || !profile) return { success: false, error: "Not logged in" };

      try {
        // 1. Verify requirements
        const stoneCount = profile.stones?.[stoneId] || 0;
        if (stoneCount <= 0) return { success: false, error: "Missing required stone" };

        const basePokemon = inventory.find(card => card.docId === fromPokemonDocId);
        if (!basePokemon) return { success: false, error: "Base Pokémon not found in inventory" };

        // 2. Fetch evolved data
        const evolvedData = await fetchPokemonById(toPokemonId);
        const newCard = generateCard(evolvedData);

        // 3. Perform evolution (database updates)
        // Deduct stone
        await updateUserStones(user.uid, stoneId, -1);
        // Remove base pokemon
        await dbRemoveCardFromInventory(user.uid, fromPokemonDocId);
        // Add new pokemon
        await dbAddCardsToInventory(user.uid, [newCard]);

        return { success: true, newCard };
      } catch (err) {
        console.error("Evolution failed:", err);
        return { success: false, error: "Evolution failed. Try again." };
      }
    },
    [user, profile, inventory]
  );

  const purchaseStone = useCallback(
    async (stoneId, price) => {
      if (!user) return { success: false, error: "AUTH_REQUIRED" };
      return await buyStoneTransaction(user.uid, stoneId, price);
    },
    [user]
  );

  const sellCard = useCallback(
    async (cardDocId, rarity) => {
      if (!user) return { success: false, error: "AUTH_REQUIRED" };
      const price = SELL_PRICES[rarity] || 40;
      return await sellCardTransaction(user.uid, cardDocId, price);
    },
    [user]
  );

  const bulkSellCards = useCallback(
    async (cardsMetadata) => {
      if (!user) return { success: false, error: "AUTH_REQUIRED" };
      
      const payload = cardsMetadata.map(c => ({
        docId: c.docId,
        price: SELL_PRICES[c.rarity] || 40
      }));

      return await bulkSellCardsTransaction(user.uid, payload);
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
    evolvePokemon,
    purchaseStone,
    sellCard,
    bulkSellCards,
    shop,
  };

  return (
    <AuthContext.Provider value={authValue}>
      <UserDataContext.Provider value={userDataValue}>
        {children}
      </UserDataContext.Provider>
    </AuthContext.Provider>
  );
}
