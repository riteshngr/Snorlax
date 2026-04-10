/**
 * db.js — Firestore database service layer.
 *
 * Handles all Firestore CRUD for user profiles, inventory,
 * and auctions. Exports clean async functions.
 */

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  runTransaction,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../backend/firebaseConfig";

// ─── User Profile ────────────────────────────────────────────

/**
 * Create a new user profile document at /users/{uid}.
 * Called once during registration.
 */
export async function createUserProfile(uid, { username, email }) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    username,
    email,
    credits: 1500,
    gems: 10,
    stones: {
      "fire-stone": 2,
      "water-stone": 2,
      "thunder-stone": 2,
      "leaf-stone": 2,
      "moon-stone": 1,
      "sun-stone": 1,
      "ice-stone": 1,
      "dusk-stone": 1,
      "dawn-stone": 1,
      "shiny-stone": 1,
    },
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch a user's profile from Firestore.
 */
export async function getUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Subscribe to real-time updates on a user's profile.
 *
 * @returns {() => void} Unsubscribe function
 */
export function onUserProfile(uid, callback) {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

/**
 * Update user credits by a delta (positive = earn, negative = spend).
 */
export async function updateUserCredits(uid, delta) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { credits: increment(delta) });
}

/**
 * Update user stone counts by a delta.
 */
export async function updateUserStones(uid, stoneId, delta) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    [`stones.${stoneId}`]: increment(delta),
  });
}

// ─── Inventory ───────────────────────────────────────────────

/**
 * Fetch all cards in a user's inventory.
 */
export async function getUserInventory(uid) {
  const inventoryRef = collection(db, "users", uid, "inventory");
  const snap = await getDocs(inventoryRef);
  return snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time changes on a user's inventory.
 *
 * @returns {() => void} Unsubscribe function
 */
export function onUserInventory(uid, callback) {
  const inventoryRef = collection(db, "users", uid, "inventory");
  return onSnapshot(inventoryRef, (snap) => {
    callback(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
  });
}

/**
 * Add multiple cards to a user's inventory (batch write).
 */
export async function addCardsToInventory(uid, cards) {
  const batch = writeBatch(db);
  const inventoryRef = collection(db, "users", uid, "inventory");

  cards.forEach((card) => {
    const cardDoc = doc(inventoryRef);
    batch.set(cardDoc, {
      pokemonId: card.id,
      name: card.name,
      image: card.image,
      types: card.types,
      attacks: card.attacks,
      rarity: card.rarity,
      genus: card.genus || "Unknown Pokémon",
      addedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

/**
 * Remove a single card from a user's inventory.
 */
export async function removeCardFromInventory(uid, cardDocId) {
  const cardRef = doc(db, "users", uid, "inventory", cardDocId);
  await deleteDoc(cardRef);
}

// ─── Auctions ────────────────────────────────────────────────

/**
 * Create a new auction listing.
 *
 * @param {object} params
 * @param {object} params.cardData - Full card data object
 * @param {string} params.sellerId - UID of the seller
 * @param {string} params.sellerUsername - Display name of the seller
 * @param {number} params.startingPrice - Starting bid price
 * @param {number} params.durationHours - Auction duration in hours
 * @returns {Promise<string>} The new auction document ID
 */
export async function createAuction({
  cardData,
  sellerId,
  sellerUsername,
  startingPrice,
  durationHours,
}) {
  const auctionsRef = collection(db, "auctions");
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + durationHours * 60 * 60 * 1000)
  );

  const docRef = await addDoc(auctionsRef, {
    cardData,
    sellerId,
    sellerUsername,
    startingPrice,
    currentBid: startingPrice,
    currentBidderId: null,
    currentBidderUsername: null,
    bidVersion: 0,
    bidCount: 0,
    expiresAt,
    createdAt: serverTimestamp(),
    status: "active",
  });

  return docRef.id;
}

/**
 * Place a bid on an auction using a Firestore transaction.
 * This is race-condition safe — if two bids hit at the same
 * millisecond, only one will win; the other will get a
 * clean rejection.
 *
 * @param {string} auctionId
 * @param {number} bidAmount
 * @param {string} bidderId
 * @param {string} bidderUsername
 * @param {number} expectedVersion - The bidVersion the client last saw
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function placeBidTransaction(
  auctionId,
  bidAmount,
  bidderId,
  bidderUsername,
  expectedVersion
) {
  const auctionRef = doc(db, "auctions", auctionId);

  try {
    await runTransaction(db, async (transaction) => {
      const auctionSnap = await transaction.get(auctionRef);

      if (!auctionSnap.exists()) {
        throw new Error("AUCTION_NOT_FOUND");
      }

      const data = auctionSnap.data();

      // Validate auction is still active
      if (data.status !== "active") {
        throw new Error("AUCTION_ENDED");
      }

      // Check expiry
      if (data.expiresAt.toDate() < new Date()) {
        throw new Error("AUCTION_EXPIRED");
      }

      // Cannot bid on your own auction
      if (data.sellerId === bidderId) {
        throw new Error("CANNOT_BID_OWN");
      }

      // Bid must exceed current bid
      if (bidAmount <= data.currentBid) {
        throw new Error("BID_TOO_LOW");
      }

      // Version check for race condition detection
      if (data.bidVersion !== expectedVersion) {
        throw new Error("VERSION_MISMATCH");
      }

      // All checks passed — commit the bid
      transaction.update(auctionRef, {
        currentBid: bidAmount,
        currentBidderId: bidderId,
        currentBidderUsername: bidderUsername,
        bidVersion: increment(1),
        bidCount: increment(1),
      });
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to all active auctions in real-time.
 *
 * @param {(auctions: object[]) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function onActiveAuctions(callback) {
  const q = query(
    collection(db, "auctions"),
    where("status", "==", "active")
  );

  return onSnapshot(
    q,
    (snap) => {
      const auctions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort client-side by createdAt descending (avoids composite index requirement)
      auctions.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      callback(auctions);
    },
    (error) => {
      console.error("Auction listener error:", error);
      // Return empty array on error so UI shows empty state
      callback([]);
    }
  );
}

/**
 * Cancel an auction (seller only). Sets status to "cancelled".
 */
export async function cancelAuction(auctionId) {
  const auctionRef = doc(db, "auctions", auctionId);
  await updateDoc(auctionRef, { status: "cancelled" });
}

// ─── Stone Shop ──────────────────────────────────────────────

/**
 * Listen to the central shop document.
 */
export function onShopState(callback) {
  const shopRef = doc(db, "shops", "stoneShop");
  return onSnapshot(shopRef, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

/**
 * Update the global shop restock state.
 */
export async function updateShopStock(stock) {
  const shopRef = doc(db, "shops", "stoneShop");
  await updateDoc(shopRef, {
    stock,
    lastRestockTime: serverTimestamp(),
  });
}

/**
 * Buy a stone using a Firestore transaction for safety.
 */
export async function buyStoneTransaction(uid, stoneId, price) {
  const userRef = doc(db, "users", uid);
  const shopRef = doc(db, "shops", "stoneShop");

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const shopSnap = await transaction.get(shopRef);

      if (!userSnap.exists() || !shopSnap.exists()) {
        throw new Error("DATA_NOT_FOUND");
      }

      const userData = userSnap.data();
      const shopData = shopSnap.data();
      const currentStock = shopData.stock?.[stoneId] || 0;

      // 1. Validation
      if (currentStock <= 0) throw new Error("SOLD_OUT");
      if (userData.credits < price) throw new Error("INSUFFICIENT_FUNDS");

      // 2. Updates
      // Deduct credits and add stone
      transaction.update(userRef, {
        credits: increment(-price),
        [`stones.${stoneId}`]: increment(1),
      });

      // Update shop stock map
      transaction.update(shopRef, {
        [`stock.${stoneId}`]: increment(-1)
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Purchase transaction failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sell a card using a Firestore transaction for safety.
 * Deletes the card from inventory and adds credits to the user profile.
 */
export async function sellCardTransaction(uid, cardDocId, price) {
  const userRef = doc(db, "users", uid);
  const cardRef = doc(db, "users", uid, "inventory", cardDocId);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const cardSnap = await transaction.get(cardRef);

      if (!userSnap.exists() || !cardSnap.exists()) {
        throw new Error("DATA_NOT_FOUND");
      }

      // 1. Delete the card
      transaction.delete(cardRef);

      // 2. Add credits
      transaction.update(userRef, {
        credits: increment(price),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Sell transaction failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sell multiple cards at once using a Firestore transaction.
 * payload: Array of { docId, price }
 */
export async function bulkSellCardsTransaction(uid, payload) {
  const userRef = doc(db, "users", uid);
  const totalPayout = payload.reduce((sum, item) => sum + item.price, 0);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("USER_NOT_FOUND");

      // 1. Delete all selected cards
      payload.forEach((item) => {
        const cardRef = doc(db, "users", uid, "inventory", item.docId);
        transaction.delete(cardRef);
      });

      // 2. Add total credits
      transaction.update(userRef, {
        credits: increment(totalPayout),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Bulk sell transaction failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete all of a user's Firestore data (inventory + profile).
 * Must be called BEFORE deleting the Firebase Auth account.
 */
export async function deleteUserData(uid) {
  const batch = writeBatch(db);

  // 1. Delete all inventory documents
  const inventoryRef = collection(db, "users", uid, "inventory");
  const inventorySnap = await getDocs(inventoryRef);
  inventorySnap.docs.forEach((d) => batch.delete(d.ref));

  // 2. Delete the user profile document
  const userRef = doc(db, "users", uid);
  batch.delete(userRef);

  await batch.commit();
}

export { db };
