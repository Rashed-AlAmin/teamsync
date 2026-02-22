const { adminDb: db } = require("../config/firebase"); // Aliased adminDb to db

const COLLECTION = "workspaces";

const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId = req.user.uid;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Workspace name is required and must be a non-empty string",
      });
    }

    const workspace = {
      name: name.trim(),
      ownerId,
      createdAt: new Date(),
    };

    const docRef = await db.collection(COLLECTION).add(workspace);

    res.status(201).json({
      id: docRef.id,
      ...workspace,
      createdAt: workspace.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({
      message: "Failed to create workspace",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const ownerId = req.user.uid;

    const snapshot = await db
      .collection(COLLECTION)
      .where("ownerId", "==", ownerId)
      .get();

    const workspaces = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? doc.data().createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({
      message: "Failed to fetch workspaces",
    });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
};