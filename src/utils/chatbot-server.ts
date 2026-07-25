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

// Feature flag: set to false to disable Gemini API calls entirely (uses regex fallback)
const GEMINI_ENABLED = false;

const GEMINI_API_KEY = () => process.env.GOOGLE_API_KEY;

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Regex-based info extraction (fallback when Gemini is unavailable) ───

function extractInfoFromMessage(message: string, currentCollected: any): any {
  const updated = { ...currentCollected };
  const msg = message.trim();

  // Name extraction: look for "my name is X", "I'm X", "this is X"
  const namePatterns = [
    /my name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /i'm\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?:[,.\s]|$)/i,
    /i am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?:[,.\s]|$)/i,
    /this is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/,
  ];
  if (!updated.name) {
    for (const p of namePatterns) {
      const match = msg.match(p);
      if (match && match[1] && !/[<>@]/.test(match[1])) {
        updated.name = match[1].trim();
        break;
      }
    }
  }

  // Email extraction
  if (!updated.email) {
    const emailMatch = msg.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) updated.email = emailMatch[1];
  }

  // Phone extraction (common US formats)
  if (!updated.phone) {
    const phoneMatch = msg.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) updated.phone = phoneMatch[0];
  }

  // Website extraction
  if (!updated.website) {
    const webMatch = msg.match(/(?:website|site|url)(?:\s+is\s+|\s+)?([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/i);
    if (webMatch) updated.website = webMatch[1].toLowerCase();
    if (!updated.website) {
      const dotComMatch = msg.match(/([a-zA-Z0-9][-a-zA-Z0-9]*\.com)/i);
      if (dotComMatch && !/email|gmail|yahoo|hotmail|outlook/i.test(dotComMatch[1])) {
        updated.website = dotComMatch[1].toLowerCase();
      }
    }
  }

  // Business type / industry extraction
  if (!updated.businessType) {
    const bizPatterns = [
      /(?:i (?:run|own|have) (?:a|an) |i'm (?:a|an) |we are (?:a|an) |business(?:\s+is)?\s+(?:a|an)?\s+)([a-zA-Z\s]+?)(?:[,.]|$|business|company)/i,
      /(?:industry|business\s+type)(?:\s+is\s+|\s*:\s*)([a-zA-Z\s]+?)(?:[,.]|$)/i,
    ];
    for (const p of bizPatterns) {
      const match = msg.match(p);
      if (match && match[1] && match[1].trim().length > 2) {
        const biz = match[1].trim();
        // Normalize common business types
        const bizLower = biz.toLowerCase();
        if (/plumb/i.test(bizLower)) updated.businessType = "Plumbing";
        else if (/hvac|heating|cooling|air cond/i.test(bizLower)) updated.businessType = "HVAC";
        else if (/dental|dentist/i.test(bizLower)) updated.businessType = "Dentistry";
        else if (/law|legal|attorney/i.test(bizLower)) updated.businessType = "Legal Services";
        else if (/clean/i.test(bizLower)) updated.businessType = "Cleaning Services";
        else if (/landscap|lawn|garden/i.test(bizLower)) updated.businessType = "Landscaping";
        else if (/electric/i.test(bizLower)) updated.businessType = "Electrical Services";
        else if (/roof/i.test(bizLower)) updated.businessType = "Roofing";
        else if (/paint/i.test(bizLower)) updated.businessType = "Painting";
        else updated.businessType = biz.charAt(0).toUpperCase() + biz.slice(1);
        break;
      }
    }
  }

  // Monthly leads extraction
  if (!updated.monthlyLeads) {
    const leadsMatch = msg.match(/(?:lead|inquir|call|client)(?:s|ies)?(?:\s+(?:per|a)\s+month)?\s*(?:is|are|:)?\s*(\d+(?:\s*[-–]\s*\d+)?)/i);
    if (leadsMatch) updated.monthlyLeads = leadsMatch[1].replace(/\s+/g, "");
    if (!updated.monthlyLeads) {
      const numMatch = msg.match(/(\d+)\s*(?:lead|inquir|call)/i);
      if (numMatch) updated.monthlyLeads = numMatch[1];
    }
  }

  return updated;
}

// ─── Fallback response generation (when Gemini is unavailable) ───

function buildFallbackReply(stage: string, collected: any, userMessage: string): string {
  const userName = collected.name || "";
  const bizType = collected.businessType || "";

  // Answer common questions about Reply AI
  const msgLower = userMessage.toLowerCase();
  if (/price|cost|pricing|how much|fee/i.test(msgLower)) {
    return "Great question! Our setup fee ranges from $1,500–$3,500 depending on complexity, and the monthly managed service is $500–$1,500. Everything's customized to your business — want to tell me a bit about what kind of business you run?";
  }
  if (/service|what do you|what does|how does|features/i.test(msgLower)) {
    return "We provide AI-powered lead conversion tools: 24/7 chatbot for your website, smart lead qualification, automated appointment booking, missed-call text-back, and follow-up sequences. Basically, we make sure no lead slips through the cracks! What industry are you in?";
  }
  if (/timeline|how long|setup time/i.test(msgLower)) {
    return "Most systems go live within 14 days of our strategy session. We handle the heavy lifting — you just tell us about your business and we'll take it from there. What type of business do you run?";
  }
  if (/demo|schedule|book|call|appointment/i.test(msgLower)) {
    return "I'd love to get you set up with a demo! To get started, could you share your name and what type of business you run?";
  }

  // Stage-based fallback
  if (stage === "completed") {
    return `Thanks for sharing all that info${userName ? ", " + userName : ""}! I've got everything I need. Would you like to book a quick demo call to see how Reply AI can help your${bizType ? " " + bizType : ""} business capture more leads?`;
  }

  const hasName = !!collected.name;
  const hasBusiness = !!collected.businessType;
  const hasContact = !!collected.email && !!collected.phone;
  const hasDetails = !!collected.website && !!collected.monthlyLeads;

  if (!hasName) {
    return "Thanks for reaching out! To get started, could you tell me your name?";
  }
  if (!hasBusiness) {
    return `Nice to meet you, ${userName}! What type of business do you run? (e.g., plumbing, HVAC, dental, legal, etc.)`;
  }
  if (!collected.email) {
    return `A ${bizType} business — great fit for our AI tools! What's the best email to reach you at?`;
  }
  if (!collected.phone) {
    return `Got it! And what's the best phone number to reach you?`;
  }
  if (!collected.website) {
    return `Almost done! What's your business website URL?`;
  }
  if (!collected.monthlyLeads) {
    return `Last question — roughly how many leads or inquiries do you get each month? This helps us size the right solution for you.`;
  }

  return "Thanks for sharing! I'm putting together your info now...";
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

      // ─── Info extraction (always run via regex fallback first) ───
      let updatedCollected = extractInfoFromMessage(message, collected);

      // ─── Gemini API call (if enabled and key available) ───
      let replyText = "";
      let geminiWorked = false;

      const apiKey = GEMINI_API_KEY();
      if (GEMINI_ENABLED && apiKey) {
        try {
          const convHistory = messages.map(m =>
            `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`
          ).join("\n");

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

          if (response.ok) {
            const aiResponse = await response.json();
            const aiText = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) {
              replyText = aiText;
              geminiWorked = true;

              // Try Gemini-based extraction
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
            }
          } else {
            console.error("Gemini API error:", response.status);
          }
        } catch (geminiError: any) {
          console.error("Gemini call failed:", geminiError.message);
        }
      }

      // ─── Use fallback reply if Gemini didn't work ───
      if (!geminiWorked) {
        replyText = buildFallbackReply(stage, updatedCollected, message);
      }

      // ─── Determine stage ───
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

      // Add assistant reply
      messages.push({ role: "assistant", content: replyText });

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
