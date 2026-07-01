const Message = require("../models/message");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
exports.sendMessage = async (req, res, next) => {
  try {
    // 1. Get message from request body
    const { content } = req.body;

    // 2. Validate — make sure message isn't empty
    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // 3. Save user message to MongoDB
    const userMessage = await Message.create({
      userId: req.user.id,     // from JWT middleware
      role: "user",
      content: content.trim(),
    });

    // 4. Get conversation history for context
    const history = await Message.find({ userId: req.user.id })
      .sort({ createdAt: 1 })   // oldest first
      .limit(20);                // last 20 messages only

    // 5. Format history for AI
    const aiMessages = history.map((msg) => ({
      role: msg.role,
       content: msg.content,
    }));

    // 6. Send to Anthropic AI and get response
    const aiResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: "You are a helpful AI assistant.",
      messages: aiMessages,
    });

    // 7. Extract AI response text
    const aiContent = aiResponse.content[0].text;

    // 8. Save AI response to MongoDB
    const assistantMessage = await Message.create({
      userId: req.user.id,
      role: "assistant",
      content: aiContent,
    });

    // 9. Send both messages back to user
    res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
      },
    });

  } catch (error) {
    next(error);
  }
};
exports.getHistory = async (req, res, next) => {
  try {
    // Only get messages belonging to logged in user
    const messages = await Message.find({ userId: req.user.id })
      .sort({ createdAt: 1 });  // oldest first = correct chat order

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });

  } catch (error) {
    next(error);
  }
};
exports.clearHistory = async (req, res, next) => {
  try {
    // Only delete messages belonging to logged in user
    await Message.deleteMany({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });

  } catch (error) {
    next(error);
  }
};
