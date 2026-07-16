import { createServerFn } from "@tanstack/react-start";
import { dbQuery } from "./db";

// Conversation state stored in DB per session
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  collected: {
    name?: string;
    email?: string;
    phone?: string;
    businessType?: string;
    website?: string;
    monthlyLeads?: string;
  };
  stage: "greeting" | "questions" | "qualifying" | "collecting" | "completed";
}

const SYSTEM_PROMPT = `You are ReplyBot, the friendly AI sales assistant for Reply AI (replyai.agency).

COMPANY INFO:
- Reply AI helps local businesses capture & convert leads using AI automation
- Services: AI chatbot, smart lead qualification, automated appointment booking, missed-call text-back, follow-up automation, CRM & analytics
- Pricing: $1,500-$3,500 setup fee, $500-$1,500/month managed service
- Industries served: Plumbers, HVAC, Dentists, Law Firms, and other local service businesses
- Timeline: Systems live within 14 days of strategy session
- Contact: hello@replyai.agency

YOUR JOB:
1. Answer questions about Reply AI naturally and enthusiastically
2. After 2-3 exchanges, gently pivot to qualifying the visitor
3. Collect their info naturally through conversation
4. Don't be pushy - be helpful and conversational
5. Keep responses concise (2-3 sentences max unless asked for details)

When you need specific info, ask ONE question at a time. First ask their name, then business type, then email/phone, then website, then monthly leads.

When all info is collected, say "Great, I've got everything I need! I'd love to show you how Reply AI can help [their business type] capture more leads. Would you like to book a quick demo call?"`;

const GEMINI_API_KEY = () => process.env.GOOGLE_API_KEY;

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const initChat = createServerFn({ method: "GET" }).handler(async () => {
  const sessionId = generateSessionId();
  const initialMsg: ChatMessage = {
    role: "assistant",
    content: "👋 Hey there! I'm ReplyBot — your AI assistant. I can tell you all about how Reply AI helps businesses like yours capture more leads automatically. What would you like to know? Or just tell me a bit about your business and I'll show you what we can do!"
  };

  try {
    await dbQuery(
      "INSERT INTO chatbot_sessions (id, messages, collected, stage, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
      [sessionId, JSON.stringify([initialMsg]), "{}", "greeting"]
    );
  } catch (e) {
    console.error("init chat db error:", e);
  }

  return { sessionId, message: initialMsg };
});

export const chatMessage = createServerFn({ method: "POST" })
  .validator((data: { sessionId: string; message: string }) => data)
  .handler(async ({ data }) => {
    const { sessionId, message } = data;

    try {
      // Get existing session
      const sessions = await dbQuery<any>("SELECT * FROM chatbot_sessions WHERE id = ?", [sessionId]);
      const session = sessions[0];
      if (!session) return { error: "Session not found" };

      const messages: ChatMessage[] = JSON.parse(session.messages || "[]");
      const collected: any = JSON.parse(session.collected || "{}");
      let stage: string = session.stage;

      // Add user message
      messages.push({ role: "user", content: message });

      // Call Gemini API
      const apiKey = GEMINI_API_KEY();
      if (!apiKey) {
        // Fallback response if no API key
        const fallback = "Thanks for your message! I'm currently being set up with my AI brain. In the meantime, feel free to use the contact form below or email hello@replyai.agency and we'll get right back to you!";
        messages.push({ role: "assistant", content: fallback });
        await dbQuery(
          "UPDATE chatbot_sessions SET messages = ?, updated_at = datetime('now') WHERE id = ?",
          [JSON.stringify(messages), sessionId]
        );
        return { messages, collected, stage, reply: fallback };
      }

      const convHistory = messages.map(m => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`).join("\n");

      let extractPrompt = "";
      if (stage !== "completed") {
        extractPrompt = `\n\nIMPORTANT: Extract any information the user provides from this conversation. 
Current collected data: ${JSON.stringify(collected)}
If the user provides any new info, note it. After this response, I will ask you to output structured data.

When you have collected ALL of: name, business type/industry, email, phone, website, and estimated monthly leads — say so and offer to book a demo.`;
      }

      const fullPrompt = SYSTEM_PROMPT + extractPrompt;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: fullPrompt + "\n\n---\n" + convHistory + "\n\nAssistant:" }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
              topP: 0.9,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errBody}`);
      }

      const aiResponse = await response.json();
      const replyText = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't quite catch that. Could you rephrase?";

      // Extract info from conversation using a second Gemini call
      let updatedCollected = { ...collected };
      try {
        const extractionResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: `Extract structured data from this conversation. Return ONLY valid JSON with these optional fields: name, email, phone, businessType, website, monthlyLeads. Use null for missing fields. No other text.

Conversation:
${convHistory}\n\nAssistant: ${replyText}

JSON:` }]
              }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
            }),
          }
        );
        if (extractionResponse.ok) {
          const extractData = await extractionResponse.json();
          const extractText = extractData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          try {
            const parsed = JSON.parse(extractText.replace(/```json|```/g, "").trim());
            if (parsed.name) updatedCollected.name = parsed.name;
            if (parsed.email) updatedCollected.email = parsed.email;
            if (parsed.phone) updatedCollected.phone = parsed.phone;
            if (parsed.businessType) updatedCollected.businessType = parsed.businessType;
            if (parsed.website) updatedCollected.website = parsed.website;
            if (parsed.monthlyLeads) updatedCollected.monthlyLeads = parsed.monthlyLeads;
          } catch {}
        }
      } catch {}

      // Add assistant reply
      messages.push({ role: "assistant", content: replyText });

      // Determine stage
      const hasName = !!updatedCollected.name;
      const hasBusiness = !!updatedCollected.businessType;
      const hasContact = !!updatedCollected.email && !!updatedCollected.phone;
      const hasDetails = !!updatedCollected.website && !!updatedCollected.monthlyLeads;

      if (hasName && hasBusiness && hasContact && hasDetails) {
        stage = "completed";
        // Save lead to database
        try {
          const existing = await dbQuery<any>("SELECT id FROM leads WHERE email = ?", [updatedCollected.email || ""]);
          if (existing.length === 0) {
            await dbQuery(
              "INSERT INTO leads (business_name, owner_name, email, phone, website, industry, personalization_notes, lead_score, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, 70, 'chatbot', 'qualified')",
              [
                updatedCollected.businessType || "",
                updatedCollected.name || "",
                updatedCollected.email || "",
                updatedCollected.phone || "",
                updatedCollected.website || "",
                updatedCollected.businessType || "",
                `Chatbot qualified. Monthly leads: ${updatedCollected.monthlyLeads || "unknown"}`
              ]
            );
          }
        } catch (e) {
          console.error("Save chatbot lead error:", e);
        }
      } else if (hasName && hasBusiness) {
        stage = "collecting";
      } else if (hasName) {
        stage = "qualifying";
      } else {
        stage = "questions";
      }

      // Save to DB
      await dbQuery(
        "UPDATE chatbot_sessions SET messages = ?, collected = ?, stage = ?, updated_at = datetime('now') WHERE id = ?",
        [JSON.stringify(messages), JSON.stringify(updatedCollected), stage, sessionId]
      );

      return { messages, collected: updatedCollected, stage, reply: replyText };
    } catch (error: any) {
      console.error("chat error:", error);
      return { error: error.message || "Something went wrong" };
    }
  });
