// routes/chatbotRoute.js
//
// No authMiddleware here on purpose — the bot is available to
// logged-out visitors too (per requirement).

const express = require("express");
const router = express.Router();
const { askChatbot } = require("../controllers/chatbotController");

router.post("/ask", askChatbot);

module.exports = router;