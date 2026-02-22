const { adminDb: db } = require("../config/firebase");

const MEMBERS_COLLECTION = "members";

const checkWorkspaceRole = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const uid = req.user?.uid;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    if (!uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const memberDoc = await db
      .collection("workspaces")
      .doc(workspaceId)
      .collection(MEMBERS_COLLECTION)
      .doc(uid)
      .get();

    if (!memberDoc.exists) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    req.member = { id: memberDoc.id, ...memberDoc.data() };
    next();
  } catch (error) {
    console.error("checkWorkspaceRole error:", error);
    res.status(500).json({ message: "Failed to verify workspace membership" });
  }
};

module.exports = checkWorkspaceRole;
