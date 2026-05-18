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

const firebaseConfig = {
  apiKey: "REDACTED_ROTATE_THIS_KEY",
  authDomain: "vvdtcoastalzone.firebaseapp.com",
  projectId: "vvdtcoastalzone",
  storageBucket: "vvdtcoastalzone.firebasestorage.app",
  messagingSenderId: "260883478600",
  appId: "1:260883478600:web:470c36306340300f63807d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;

window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.query = query;
window.orderBy = orderBy;
window.limit = limit;

console.log("Firebase + Firestore connected");