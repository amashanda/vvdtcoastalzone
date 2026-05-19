// ─────────────────────────────────────────────────────────────────────────────
// firebase-config.example.js  —  TEMPLATE ONLY, safe to commit
// ─────────────────────────────────────────────────────────────────────────────
// 1. Copy this file:  cp firebase-config.example.js firebase-config.js
// 2. Replace every placeholder with your Firebase project values.
// 3. firebase-config.js is in .gitignore — it will NEVER be committed.
//
// For GitHub Pages deployment the values are injected automatically
// from the FIREBASE_CONFIG_JSON repository secret by the Actions workflow.
// ─────────────────────────────────────────────────────────────────────────────

window.FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "1:YOUR_SENDER_ID:web:YOUR_APP_ID"
};
