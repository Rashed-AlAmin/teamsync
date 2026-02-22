const { adminAuth } = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Split "Bearer <token>" to get just the string
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Malformed token header",
      });
    }

    // Use adminAuth directly (no .auth() call needed)
    const decodedToken = await adminAuth.verifyIdToken(token);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error.code, error.message);

    return res.status(401).json({
      message: "Unauthorized",
      error: error.message 
    });
  }
};

module.exports = verifyToken;