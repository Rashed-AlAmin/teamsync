const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const checkWorkspaceRole = require("../middleware/checkWorkspaceRole");
const {
  createWorkspace,
  getWorkspaces,
  inviteUser,
  getMembers,
  createChannel,
  getChannels,
  sendMessage,
  getMessages,
  createTask,
  getTasks,
  updateTaskStatus,
} = require("../controllers/workspaceController");
const { uploadFile } = require("../controllers/fileUploadController");
const handleUpload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(verifyToken);

router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.post("/:workspaceId/invite", checkWorkspaceRole, inviteUser);
router.get("/:workspaceId/members", checkWorkspaceRole, getMembers);
router.post("/:workspaceId/channels", checkWorkspaceRole, createChannel);
router.get("/:workspaceId/channels", checkWorkspaceRole, getChannels);
router.post(
  "/:workspaceId/channels/:channelId/upload",
  checkWorkspaceRole,
  handleUpload,
  uploadFile
);
router.post(
  "/:workspaceId/channels/:channelId/messages",
  checkWorkspaceRole,
  sendMessage
);
router.get(
  "/:workspaceId/channels/:channelId/messages",
  checkWorkspaceRole,
  getMessages
);

router.post(
  "/:workspaceId/tasks",
  checkWorkspaceRole,
  createTask
);

router.get(
  "/:workspaceId/tasks",
  checkWorkspaceRole,
  getTasks
);

router.patch(
  "/:workspaceId/tasks/:taskId",
  checkWorkspaceRole,
  updateTaskStatus
);

module.exports = router;

