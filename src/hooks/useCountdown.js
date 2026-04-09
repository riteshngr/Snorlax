/**
 * useCountdown.js — Countdown timer hook.
 *
 * Takes an expiry Date/Timestamp and returns live-updating
 * hours, minutes, seconds until expiry.
 */

import { useState, useEffect } from "react";

/**
 * @param {Date|{toDate: () => Date}|string|number} expiresAt
 * @returns {{ hours: number, minutes: number, seconds: number, isExpired: boolean, formatted: string }}
 */
export default function useCountdown(expiresAt) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return timeLeft;
}

function calcTimeLeft(expiresAt) {
  if (!expiresAt) return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "00:00:00" };

  let expiry;
  if (expiresAt.toDate) {
    expiry = expiresAt.toDate();
  } else if (expiresAt instanceof Date) {
    expiry = expiresAt;
  } else {
    expiry = new Date(expiresAt);
  }

  const now = new Date();
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "00:00:00" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { hours, minutes, seconds, isExpired: false, formatted };
}
