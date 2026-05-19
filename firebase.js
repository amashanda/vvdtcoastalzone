import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase credentials are injected at deploy time via firebase-config.js.
// That file is git-ignored — never commit real API keys.
// See firebase-config.example.js for the required shape.
if (!window.FIREBASE_CONFIG) {
  console.warn(
    "VVDT: firebase-config.js not found. " +
    "Copy firebase-config.example.js → firebase-config.js and fill in your credentials."
  );
}

const app = initializeApp(window.FIREBASE_CONFIG || {});
const db = getFirestore(app);

window.db = db;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.query = query;
window.orderBy = orderBy;
window.limit = limit;

console.log("Firebase + Firestore connected");
