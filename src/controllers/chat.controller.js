const db = require("../lib/db");
const { conversations, messages } = require("../db/schema");
const { eq, desc, and } = require("drizzle-orm");

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ------------------------------ HELPERS ------------------------------ */

const cleanOutput = (text) => {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?\n/, "")
    .replace(/```$/, "")
    .trim();
};

/* ------------------------------ GENERATE ----------------------------- */

exports.generateCode = async (req, res) => {
  const { prompt, language = "python", chatId } = req.body; // chatId is optional (conversation ID)
  const userId = req.userId;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "OpenAI API key not configured",
    });
  }

  try {
    let conversationId = chatId;

    // 1. If no conversation ID, create a new conversation
    if (!conversationId) {
      const [newConv] = await db
        .insert(conversations)
        .values({
          userId,
          title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
        })
        .returning();
      conversationId = newConv.id;
    } else {
      // Verify ownership
      const [existing] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.userId, userId)
          )
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
    }

    // 2. Save USER message
    await db.insert(messages).values({
      conversationId,
      role: "user",
      content: prompt,
      language: language,
    });

    // 3. Generate AI Response
    const systemPrompt = `
You are an expert AI coding assistant.

Rules:
- Output ONLY runnable code
- No markdown
- No backticks
- No explanations
- Comments allowed only inside code

Language: ${language}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const rawText = completion.choices[0]?.message?.content;
    const code = cleanOutput(rawText);

    if (!code) {
      throw new Error("Empty OpenAI response");
    }

    // 4. Save ASSISTANT message
    const [savedMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        role: "assistant",
        content: code, // The generated code
        language,
      })
      .returning();

    // 5. Respond
    res.status(200).json({
      success: true,
      message: "Code generated successfully",
      data: {
        conversationId,         // Frontend needs this to switch context if it was new
        messageId: savedMessage.id,
        response: code,
        language,
        timestamp: savedMessage.createdAt,
      },
    });

  } catch (error) {
    console.error("Generate error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate code",
      error: error.message,
    });
  }
};

/* ----------------------------- GET ALL CHATS ----------------------------- */

exports.getChats = async (req, res) => {
  const userId = req.userId;

  try {
    const data = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chats",
    });
  }
};

/* ---------------------------- GET SINGLE CHAT ---------------------------- */

exports.getChat = async (req, res) => {
  const userId = req.userId;
  const conversationId = Number(req.params.id);

  try {
    // 1. Get Conversation Metadata (and verify ownership)
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation || conversation.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // 2. Get Messages
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt); // Ascending order for chat history

    res.status(200).json({
      success: true,
      data: {
        chat: conversation,
        messages: chatMessages,
      },
    });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat",
    });
  }
};
