const admin = require("firebase-admin");
const { adminDb: db, adminAuth } = require("../config/firebase");

const COLLECTION = "workspaces";
const MEMBERS_COLLECTION = "members";

const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId = req.user.uid;
    const email = req.user.email || "";

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

    const member = {
      uid: ownerId,
      email,
      role: "admin",
      joinedAt: new Date(),
    };
    await docRef.collection(MEMBERS_COLLECTION).doc(ownerId).set(member);

    const generalChannel = {
      name: "general",
      description: "General discussion",
      type: "public",
      createdBy: ownerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.collection("channels").add(generalChannel);

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
    const userId = req.user.uid;

    // 1. Find all "members" documents across the whole DB that match this user's UID
    // This requires a Firestore index. Check your terminal/console for a link if it fails.
    const memberSnapshot = await db
      .collectionGroup(MEMBERS_COLLECTION)
      .where("uid", "==", userId)
      .get();

    if (memberSnapshot.empty) {
      return res.json([]);
    }

    // 2. For each member record, get the parent Workspace document
    const workspacePromises = memberSnapshot.docs.map(async (memberDoc) => {
      // memberDoc.ref.parent is the "members" collection
      // memberDoc.ref.parent.parent is the actual Workspace document
      const workspaceDoc = await memberDoc.ref.parent.parent.get();
      
      if (!workspaceDoc.exists) return null;

      const data = workspaceDoc.data();
      return {
        id: workspaceDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      };
    });

    const workspaces = (await Promise.all(workspacePromises))
      .filter(ws => ws !== null) // Remove any nulls if a workspace was deleted
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({
      message: "Failed to fetch workspaces",
    });
  }
};

const inviteUser = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    const workspaceDoc = await db.collection(COLLECTION).doc(workspaceId).get();
    if (!workspaceDoc.exists) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (req.member.role !== "admin") {
      return res.status(403).json({
        message: "Only workspace admins can invite users",
      });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let firebaseUser;
    try {
      firebaseUser = await adminAuth.getUserByEmail(normalizedEmail);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return res.status(404).json({
          message: "No user found with this email",
        });
      }
      throw error;
    }

    const memberRef = db
      .collection(COLLECTION)
      .doc(workspaceId)
      .collection(MEMBERS_COLLECTION)
      .doc(firebaseUser.uid);

    const existingMember = await memberRef.get();
    if (existingMember.exists) {
      return res.status(409).json({
        message: "User is already a member of this workspace",
      });
    }

    const member = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: "member",
      joinedAt: new Date(),
    };
    await memberRef.set(member);

    res.status(201).json({
      message: "User invited successfully",
      member: {
        uid: member.uid,
        email: member.email,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({
      message: "Failed to invite user",
    });
  }
};

const getMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspaceDoc = await db.collection(COLLECTION).doc(workspaceId).get();
    if (!workspaceDoc.exists) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const snapshot = await db
      .collection(COLLECTION)
      .doc(workspaceId)
      .collection(MEMBERS_COLLECTION)
      .get();

    const members = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        ...data,
        joinedAt: data.joinedAt?.toDate?.()?.toISOString() ?? data.joinedAt,
      };
    });

    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({
      message: "Failed to fetch workspace members",
    });
  }
};

const createChannel = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, type } = req.body;

    const workspaceDoc = await db.collection(COLLECTION).doc(workspaceId).get();
    if (!workspaceDoc.exists) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (req.member.role !== "admin") {
      return res.status(403).json({
        message: "Only workspace admins can create channels",
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Channel name is required and must be a non-empty string",
      });
    }

    const channelData = {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      type: type === "private" ? "private" : "public",
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const channelRef = await db
      .collection(COLLECTION)
      .doc(workspaceId)
      .collection("channels")
      .add(channelData);

    const saved = await channelRef.get();
    const data = saved.data();

    res.status(201).json({
      id: saved.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({
      message: "Failed to create channel",
    });
  }
};

const getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspaceDoc = await db.collection(COLLECTION).doc(workspaceId).get();
    if (!workspaceDoc.exists) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const snapshot = await db
      .collection(COLLECTION)
      .doc(workspaceId)
      .collection("channels")
      .orderBy("createdAt", "asc")
      .get();

    const channels = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      };
    });

    res.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({
      message: "Failed to fetch channels",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { workspaceId, channelId } = req.params;
    const { content, type, fileUrl, fileName } = req.body || {};

    const hasFile = fileUrl && typeof fileUrl === "string" && fileUrl.trim();
    const textContent =
      typeof content === "string" ? content.trim() : "";

    if (!hasFile && !textContent) {
      return res.status(400).json({
        message:
          "Message content or fileUrl is required",
      });
    }

    const channelRef = db
      .collection(COLLECTION)
      .doc(workspaceId)
      .collection("channels")
      .doc(channelId);

    const channelDoc = await channelRef.get();
    if (!channelDoc.exists) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const senderId = req.user.uid;
    const senderName =
      req.user.name || req.user.displayName || req.user.email || "";

    let messageType = "text";
    const baseMessage = {
      senderId,
      senderName,
      content: textContent,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (hasFile) {
      baseMessage.fileUrl = fileUrl.trim();
      baseMessage.fileName =
        typeof fileName === "string" && fileName.trim()
          ? fileName.trim()
          : "file";
      messageType = type === "image" ? "image" : "file";
    }

    const message = { ...baseMessage, type: messageType };

    const messageRef = await channelRef.collection("messages").add(message);
    const saved = await messageRef.get();
    const data = saved.data();

    res.status(201).json({
      id: saved.id,
      ...data,
      timestamp: data.timestamp?.toDate?.()?.toISOString() ?? data.timestamp,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      message: "Failed to send message",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { workspaceId, channelId } = req.params;

    const channelRef = db
      .collection(COLLECTION)
      .doc(workspaceId)
      .collection("channels")
      .doc(channelId);

    const channelDoc = await channelRef.get();
    if (!channelDoc.exists) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const snapshot = await channelRef
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? data.timestamp,
      };
    });

    // Return messages in chronological order (oldest first)
    messages.reverse();

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  inviteUser,
  getMembers,
  createChannel,
  getChannels,
  sendMessage,
  getMessages,
};