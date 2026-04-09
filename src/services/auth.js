/**
 * auth.js — Firebase Authentication service layer.
 *
 * Wraps Firebase Auth SDK calls with clean async functions
 * for the rest of the app to consume.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../backend/firebaseConfig";
import { createUserProfile } from "./db";

/**
 * Register a new user with email, password, and display username.
 * Also creates their Firestore profile document.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function registerUser(email, password, username) {
  // 1. Create the Firebase Auth account
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // 2. Set display name on the Auth profile
  await updateProfile(userCredential.user, { displayName: username });

  // 3. Create the Firestore user document
  await createUserProfile(userCredential.user.uid, {
    username,
    email,
  });

  return userCredential;
}

/**
 * Sign in an existing user with email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Subscribe to auth state changes.
 *
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the currently signed-in user (synchronous snapshot).
 *
 * @returns {import("firebase/auth").User | null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}
