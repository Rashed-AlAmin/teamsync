// config/firebase.js
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const path = require("path");

// 1. ADMIN (Use the new file name you chose)
let serviceAccount;

try {
  // If the variable is a string (like on Render), parse it. 
  // If it's already an object, use it.
  serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : process.env.FIREBASE_SERVICE_ACCOUNT;
} catch (error) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", error.message);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

// 2. CLIENT (New .env values)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const clientApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);

// Test Log
adminDb.collection('test').doc('conn').set({ ok: true })
  .then(() => console.log("🚀 BOOM! Connection Successful!"))
  .catch((e) => console.log("❌ Still failing:", e.message));

module.exports = { adminDb, adminAuth, adminStorage, clientAuth };