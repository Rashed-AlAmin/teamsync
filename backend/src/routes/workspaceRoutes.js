const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const { createWorkspace, getWorkspaces } = require("../controllers/workspaceController");


const router = express.Router();

router.use(verifyToken);

router.post("/", createWorkspace);
router.get("/", getWorkspaces);



module.exports = router;

