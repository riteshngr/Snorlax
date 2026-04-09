/**
 * useAuctionListener.js — Real-time Firestore subscription
 * for active auctions. Replaces the empty useSocket.js.
 *
 * Uses Firestore onSnapshot for WebSocket-like real-time sync.
 */

import { useState, useEffect } from "react";
import { onActiveAuctions } from "../services/db";

/**
 * Subscribe to all active auctions in real-time.
 *
 * @returns {{ auctions: object[], loading: boolean, error: string|null }}
 */
export default function useAuctionListener() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onActiveAuctions((auctionList) => {
      // Filter out expired auctions client-side as well
      const now = new Date();
      const active = auctionList.filter((a) => {
        if (!a.expiresAt) return false;
        const expiry = a.expiresAt.toDate ? a.expiresAt.toDate() : new Date(a.expiresAt);
        return expiry > now;
      });

      setAuctions(active);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { auctions, loading, error };
}
