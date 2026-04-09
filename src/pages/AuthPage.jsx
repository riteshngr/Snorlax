import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser, loginUser } from "../services/auth";

/**
 * AuthPage — Full-screen register/login page.
 *
 * Gate: The user cannot access the app until they authenticate.
 * Works with Firebase Auth (email + password) and stores a display username.
 */
export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validation
    if (isRegister) {
      if (!username.trim()) {
        setError("Username is required.");
        return;
      }
      if (username.trim().length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email, password, username.trim());
      } else {
        await loginUser(email, password);
      }
      // Auth state listener in Store.jsx will handle the redirect
    } catch (err) {
      // Map Firebase error codes to user-friendly messages
      const code = err.code || "";
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError(null);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950 overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-800/8 rounded-full blur-[120px]" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glassmorphic card */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/70 backdrop-blur-xl shadow-[0_0_80px_rgba(88,28,135,0.15)] overflow-hidden">
          
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full text-white/80 drop-shadow-xl">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" />
                </svg>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Poke<span className="text-purple-400">Vault</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mt-1">
                {isRegister ? "Create Your Trainer Account" : "Welcome Back, Trainer"}
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex rounded-xl bg-gray-800/60 border border-gray-700/40 p-1 mb-6">
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  mode === "login"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode("register"); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  mode === "register"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Register
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
                >
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isRegister && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Trainer Name
                    </label>
                    <input
                      id="auth-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username..."
                      className="w-full rounded-xl border border-gray-700/60 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                      maxLength={20}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trainer@pokevault.com"
                  className="w-full rounded-xl border border-gray-700/60 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-700/60 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                  required
                  minLength={6}
                />
              </div>

              <AnimatePresence mode="wait">
                {isRegister && (
                  <motion.div
                    key="confirm-password"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Confirm Password
                    </label>
                    <input
                      id="auth-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-700/60 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className={`w-full rounded-xl py-3.5 font-bold text-white uppercase tracking-widest transition-all ${
                  loading
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isRegister ? "Creating Account..." : "Signing In..."}
                  </span>
                ) : isRegister ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            {/* Toggle link */}
            <p className="mt-6 text-center text-xs text-gray-500">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
          </div>

          {/* Bottom gradient bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0" />
        </div>

        {/* Tagline below card */}
        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">
          Collect · Trade · Dominate
        </p>
      </motion.div>
    </div>
  );
}
