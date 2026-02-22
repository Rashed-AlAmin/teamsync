// config/firebase.js
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const path = require("path");

// 1. ADMIN (Use the new file name you chose)
const serviceAccount = require(path.join(__dirname, "../../serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // No databaseURL needed for us-central1 default
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

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

module.exports = { adminDb, adminAuth, clientAuth };