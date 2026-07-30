import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Feature flag: set to false to disable Gemini API calls entirely (uses fallback logic)
const GEMINI_QUALIFICATION_ENABLED = false;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (!GEMINI_QUALIFICATION_ENABLED) return null;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set — AI features disabled.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

// ─── Lead Qualification ───────────────────────────────────────────────

export interface QualificationResult {
  score: number;            // 0–100
  summary: string;          // 1–2 line qualification summary
  nextAction: string;       // "call immediately" | "email first" | "low priority"
}

export const qualifyLead = createServerFn({ method: "POST" })
  .validator((data: { businessName: string; ownerName?: string; message: string; source?: string }) => data)
  .handler(async ({ data }): Promise<QualificationResult | null> => {
    const genAI = getGeminiClient();
    if (!genAI) {
      // Return fallback qualification when Gemini is disabled
      const hasMessage = data.message && data.message.length > 20;
      return {
        score: hasMessage ? 65 : 40,
        summary: hasMessage
          ? `${data.businessName || "Lead"} submitted a detailed inquiry via ${data.source || "website"}. Interest level appears genuine.`
          : `${data.businessName || "Lead"} submitted a brief inquiry via ${data.source || "website"}. Needs further qualification.`,
        nextAction: hasMessage ? "email first" : "low priority",
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a lead qualification assistant for Reply AI, a company that helps small local businesses capture and convert leads using AI automation (chatbots, appointment booking, missed-call text-back, follow-up sequences). Pricing: $1,500–$3,500 setup + $500–$1,500/month.

Analyze this inbound lead and return ONLY valid JSON (no markdown, no backticks, no other text) with exactly these fields:
- "score": number (0-100) assessing intent, urgency, and fit based on the message
- "summary": short 1–2 sentence summary of the lead's situation and fit
- "nextAction": one of "call immediately", "email first", or "low priority"

Scoring guidelines:
- 80–100: Clear pain point, ready to buy, urgent timeline, good fit for our services
- 50–79: Interested but vague, needs nurturing, decent fit
- 0–49: Just browsing, poor fit, spam, or very low intent

Lead details:
- Business: ${data.businessName}
- Contact: ${data.ownerName || "Not provided"}
- Source: ${data.source || "website"}
- Message: "${data.message}"

JSON:`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Parse the JSON response
      const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      // Validate and clamp the score
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 50)));

      // Validate nextAction
      const validActions = ["call immediately", "email first", "low priority"];
      const nextAction = validActions.includes(parsed.nextAction?.toLowerCase())
        ? parsed.nextAction.toLowerCase()
        : "email first";

      return {
        score,
        summary: String(parsed.summary || "No summary available.").slice(0, 300),
        nextAction,
      };
    } catch (error) {
      console.error("qualifyLead AI error:", error);
      return null;
    }
  });

// ─── Proposal Generation ──────────────────────────────────────────────

export interface ProposalInput {
  businessName: string;
  ownerName?: string;
  industry?: string;
  message?: string;
  leadScore?: number;
}

export const generateProposal = createServerFn({ method: "POST" })
  .validator((data: ProposalInput) => data)
  .handler(async ({ data }): Promise<string | null> => {
    const genAI = getGeminiClient();
    if (!genAI) {
      // Return template-based proposal when Gemini is disabled
      return `# AI Lead Conversion Proposal for ${data.businessName}

## Hi${data.ownerName ? " " + data.ownerName : ""}!

Thank you for your interest in Reply AI. Based on what you've shared about ${data.businessName}${data.industry ? " (" + data.industry + ")" : ""}, we've put together a custom proposal for how we can help you capture and convert more leads automatically.

## Your Situation
${data.message ? `> "${data.message}"\n\n` : ""}As a local business, you know that every inquiry is a potential customer. But following up manually means leads slip through the cracks — especially after hours, on weekends, or when you're busy serving clients.

## Recommended Solutions

### 1. AI Chatbot — 24/7 Lead Capture
An intelligent chatbot on your website that answers questions instantly, qualifies leads, and captures contact info — even at 2 AM.

### 2. Smart Lead Qualification
Every lead is automatically scored and routed to the right person. Hot leads get immediate attention; tire-kickers get nurturing.

### 3. Automated Follow-Up Sequences
Email and SMS sequences that follow up with every lead automatically — no more forgotten follow-ups.

## Investment

| Item | Range |
|------|-------|
| One-time Setup | $1,500 – $3,500 |
| Monthly Managed Service | $500 – $1,500/mo |

*Exact pricing depends on your specific needs — we'll scope it during our strategy call.*

## Timeline
Most systems go live within **14 days** of our initial strategy session.

## Next Step
Ready to stop losing leads? Let's jump on a quick 20-minute strategy call to go over your specific needs. 

📧 **hello@replyai.agency**
🌐 **replyai.agency**

---
*Proposal generated for ${data.businessName} — ${new Date().toLocaleDateString()}*`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a sales proposal writer for Reply AI (replyai.agency), a company that provides AI-powered lead conversion systems for small local businesses.

Our services:
- AI Chatbot (24/7 instant inquiry handling on their website)
- Smart Lead Qualification (auto-score and route leads)
- Automated Appointment Booking (calendar sync)
- Missed-Call Text-Back (SMS automation)
- Follow-Up Automation (email/SMS sequences)
- CRM Integration & Analytics

Standard pricing:
- Setup fee: $1,500–$3,500 (one-time, depends on complexity)
- Monthly retainer: $500–$1,500/mo (managed service)
- Timeline: System live within 14 days of strategy session

Write a personalized proposal in Markdown format for this lead. Keep it concise but compelling (300–500 words). Include:

1. A personalized greeting referencing their business
2. Their likely pain points based on the industry/message
3. 2–3 recommended solutions from our stack (most relevant to them)
4. Estimated pricing (range)
5. Timeline
6. A clear call-to-action to book a strategy call

Lead details:
- Business: ${data.businessName}
- Contact: ${data.ownerName || "Not provided"}
- Industry: ${data.industry || "Not specified"}
- Lead Score: ${data.leadScore ?? "N/A"}/100
- Their message/context: "${data.message || "No additional context provided."}"

Output ONLY the Markdown proposal — no preamble, no meta-commentary. Start with "# AI Lead Conversion Proposal for ${data.businessName}".`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return text;
    } catch (error) {
      console.error("generateProposal AI error:", error);
      return null;
    }
  });
