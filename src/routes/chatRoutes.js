/**
 * Chat Routes
 *
 * Defines all API endpoints for the chat system.
 * All routes are protected by JWT middleware.
 *
 * POST   /api/chat/send      → Send message + get AI response
 * GET    /api/chat/history   → Get conversation history
 * DELETE /api/chat/history   → Clear chat history
 */

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