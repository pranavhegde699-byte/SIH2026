const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { answerQuery } = require('../services/chatService');

// Stricter rate limit for chat endpoint since LLM calls are expensive
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { success: false, message: 'Too many chat requests. Please wait a moment.' }
});

router.post('/', chatLimiter, async (req, res, next) => {
  try {
    const { message, businessProfileId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const result = await answerQuery(message.trim(), businessProfileId || null);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
