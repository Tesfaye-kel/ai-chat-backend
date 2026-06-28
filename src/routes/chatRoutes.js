

const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getHistory,
  clearHistory,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// All routes require valid JWT token
router.post("/send", protect, sendMessage);
router.get("/history", protect, getHistory);
router.delete("/history", protect, clearHistory);

module.exports = router;
