const admin = require("firebase-admin");
const { adminDb: db, adminStorage } = require("../config/firebase");

const COLLECTION = "workspaces";
const TEN_YEARS_SECONDS = 10 * 365 * 24 * 60 * 60;

const uploadFile = async (req, res) => {
  try {
    const { workspaceId, channelId } = req.params;
    const { content } = req.body || {};
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const workspaceDoc = await db.collection(COLLECTION).doc(workspaceId).get();
    if (!workspaceDoc.exists) {
      return res.status(404).json({ message: "Workspace not found" });
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

    const bucket = process.env.FIREBASE_STORAGE_BUCKET
      ? adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET)
      : adminStorage.bucket();
    const originalName = file.originalname || "file";
    const ext = originalName.includes(".")
      ? originalName.slice(originalName.lastIndexOf("."))
      : "";
    const timestamp = Date.now();
    const safeName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const storagePath = `workspaces/${workspaceId}/channels/${channelId}/${safeName}`;

    const fileRef = bucket.file(storagePath);

    await fileRef.save(file.buffer, {
      metadata: { contentType: file.mimetype || "application/octet-stream" },
    });

    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + TEN_YEARS_SECONDS * 1000,
    });

    const senderId = req.user.uid;
    const senderName =
      req.user.name || req.user.displayName || req.user.email || "";

    const isImage =
      file.mimetype && file.mimetype.startsWith("image/");
    const messageType = isImage ? "image" : "file";

    const message = {
      senderId,
      senderName,
      content: (typeof content === "string" && content.trim()) || "",
      type: messageType,
      fileUrl: signedUrl,
      fileName: originalName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const messageRef = await channelRef.collection("messages").add(message);
    const saved = await messageRef.get();
    const data = saved.data();

    res.status(201).json({
      id: saved.id,
      ...data,
      timestamp: data.timestamp?.toDate?.()?.toISOString() ?? data.timestamp,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      message: "Failed to upload file",
    });
  }
};

module.exports = { uploadFile };
