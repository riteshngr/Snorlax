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
    credits: 1000,
    gems: 10,
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

export { db };
