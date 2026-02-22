const { clientAuth, adminDb } = require("../config/firebase");
const { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} = require("firebase/auth");

// SIGNUP: Create user in Auth + Create Profile in Firestore
const signup = async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
    const user = userCredential.user;

    // 2. Create a document in "users" collection using adminDb
    await adminDb.collection("users").doc(user.uid).set({
      email,
      displayName: displayName || "New Member",
      createdAt: new Date(),
      workspaces: [] // To track which workspaces they belong to later
    });

    const token = await user.getIdToken();

    res.status(201).json({
      message: "User created successfully",
      token,
      uid: user.uid
    });
  } catch (error) {
    console.error("--- SIGNUP ERROR REPORT ---");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    res.status(400).json({ message: "Signup failed", error: error.message });
  }
};

// LOGIN: Exchange credentials for a fresh ID Token
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const token = await userCredential.user.getIdToken();

    res.json({
      message: "Login successful",
      token,
      uid: userCredential.user.uid
    });
  } catch (error) {
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = { signup, login };