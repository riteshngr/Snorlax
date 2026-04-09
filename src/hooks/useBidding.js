/**
 * useBidding.js — Race-condition-safe bidding hook.
 *
 * Implements Optimistic Updates + Versioned Transactions:
 *   1. Instantly update UI (optimistic)
 *   2. Run Firestore transaction (with version check)
 *   3. On rejection → gracefully roll back and notify
 */

import { useState, useCallback } from "react";
import { placeBidTransaction } from "../services/db";

/**
 * @param {string} auctionId
 * @returns {{ placeBid, optimisticBid, bidStatus, resetBidStatus }}
 */
export default function useBidding(auctionId) {
  // optimisticBid = the bid the UI is currently showing before server confirmation
  const [optimisticBid, setOptimisticBid] = useState(null);

  // 'idle' | 'pending' | 'confirmed' | 'rejected'
  const [bidStatus, setBidStatus] = useState("idle");

  // Error message shown on rejection
  const [bidError, setBidError] = useState(null);

  /**
   * Place a bid. This function is the main entry point.
   *
   * @param {number} amount         - The bid amount in credits
   * @param {string} bidderId       - UID of the bidder
   * @param {string} bidderUsername  - Display name of the bidder
   * @param {number} expectedVersion - The bidVersion the client last saw
   */
  const placeBid = useCallback(
    async (amount, bidderId, bidderUsername, expectedVersion) => {
      if (!auctionId) return;

      // 1. OPTIMISTIC UPDATE — instantly show the bid in UI
      setOptimisticBid({
        amount,
        bidderUsername,
        timestamp: Date.now(),
      });
      setBidStatus("pending");
      setBidError(null);

      // 2. VERSIONED TRANSACTION — server-side validation
      const result = await placeBidTransaction(
        auctionId,
        amount,
        bidderId,
        bidderUsername,
        expectedVersion
      );

      if (result.success) {
        // 3a. BID CONFIRMED — the onSnapshot listener will update the UI
        setBidStatus("confirmed");
        setOptimisticBid(null); // Clear optimistic state, real data takes over

        // Auto-reset status after a few seconds
        setTimeout(() => setBidStatus("idle"), 3000);
      } else {
        // 3b. GRACEFUL REJECTION — roll back the optimistic UI
        setOptimisticBid(null);
        setBidStatus("rejected");

        // Map error codes to user-friendly messages
        const errorMessages = {
          BID_TOO_LOW: "Someone outbid you! Try a higher amount.",
          VERSION_MISMATCH: "The auction was updated. Refreshing...",
          AUCTION_ENDED: "This auction has ended.",
          AUCTION_EXPIRED: "This auction has expired.",
          AUCTION_NOT_FOUND: "Auction no longer exists.",
          CANNOT_BID_OWN: "You can't bid on your own auction.",
        };

        setBidError(
          errorMessages[result.error] || "Bid failed. Please try again."
        );

        // Auto-reset after 5 seconds
        setTimeout(() => {
          setBidStatus("idle");
          setBidError(null);
        }, 5000);
      }
    },
    [auctionId]
  );

  const resetBidStatus = useCallback(() => {
    setBidStatus("idle");
    setOptimisticBid(null);
    setBidError(null);
  }, []);

  return {
    placeBid,
    optimisticBid,
    bidStatus,
    bidError,
    resetBidStatus,
  };
}
