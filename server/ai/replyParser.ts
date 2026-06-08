/**
 * Parsing of raw LLM output for the consumer chatbot. Pure and unit-tested so
 * the escalation/cleaning behaviour can't silently regress.
 */
export interface ParsedReply {
  reply: string;
  escalated: boolean;
}

const FALLBACK = "Sorry, I didn't catch that. Could you try again?";

export function parseAssistantReply(raw: unknown): ParsedReply {
  const base = (typeof raw === "string" ? raw : null) ?? FALLBACK;
  const escalated = base.includes("ESCALATE");
  const reply = base.replace(/ESCALATE/g, "").trim() || FALLBACK;
  return { reply, escalated };
}
