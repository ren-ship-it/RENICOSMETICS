import { describe, it, expect } from "vitest";
import { appRouter, RENI_SYSTEM_PROMPT } from "./routers";
import { ADMIN_AI_SYSTEM_PROMPT } from "./analytics/router";
import { parseAssistantReply } from "./ai/replyParser";

/**
 * Automated AI safety checks for the STRUCTURAL guarantees (role-gating, input
 * validation, reply parsing, and prompt-guardrail regression). Live LLM
 * behavioural red-teaming still runs in staging per docs/AI_SAFETY_TEST_REPORT.md,
 * but these tests lock down the parts that don't require a model.
 */
function anonCtx() {
  return { user: null, customer: null, req: { headers: {} }, res: {} } as any;
}

describe("Consumer reply parsing", () => {
  it("strips the ESCALATE marker and flags escalation", () => {
    const r = parseAssistantReply("Email the team to sort this. ESCALATE");
    expect(r.escalated).toBe(true);
    expect(r.reply).not.toContain("ESCALATE");
  });
  it("does not flag normal replies", () => {
    const r = parseAssistantReply("Free shipping applies over $80.");
    expect(r.escalated).toBe(false);
    expect(r.reply).toBe("Free shipping applies over $80.");
  });
  it("falls back safely on non-string output", () => {
    expect(parseAssistantReply(null).reply.length).toBeGreaterThan(0);
    expect(parseAssistantReply(undefined).escalated).toBe(false);
  });
});

describe("Role separation / access control (structural)", () => {
  it("blocks anonymous callers from the admin AI assistant", async () => {
    const caller = appRouter.createCaller(anonCtx());
    await expect(
      caller.analytics.ask({ message: "What is today's revenue?", history: [], windowDays: 30 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("blocks anonymous callers from identified at-risk customer data", async () => {
    const caller = appRouter.createCaller(anonCtx());
    await expect(caller.analytics.insights.atRiskCustomers({ limit: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("blocks anonymous callers from admin product mutations", async () => {
    const caller = appRouter.createCaller(anonCtx());
    // Blocked either as UNAUTHORIZED (no session) or FORBIDDEN (not admin).
    await expect(
      caller.products.create({ slug: "x", name: "x", price: "1" } as any),
    ).rejects.toMatchObject({ code: expect.stringMatching(/UNAUTHORIZED|FORBIDDEN/) });
  });
  it("blocks anonymous callers from admin content CRUD", async () => {
    const caller = appRouter.createCaller(anonCtx());
    await expect(caller.content.journalAdminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("Consumer chatbot prompt guardrails (regression)", () => {
  const persona = { id: 0, name: "Mila", role: "Advisor", greeting: "", outOfHours: "", style: "calm" };
  const prompt = RENI_SYSTEM_PROMPT(persona as any, false);
  it("refuses business / internal data access", () => {
    expect(prompt).toMatch(/no access to business analytics|internal or business information/i);
  });
  it("forbids fabricating product/price/stock/policy", () => {
    expect(prompt).toMatch(/never invent product/i);
  });
  it("keeps medical guardrails", () => {
    expect(prompt).toMatch(/not a doctor|medical advice/i);
  });
  it("resists instruction override / role confusion", () => {
    expect(prompt).toMatch(/ignore any instruction/i);
  });
});

describe("Admin AI prompt guardrails (regression)", () => {
  const prompt = ADMIN_AI_SYSTEM_PROMPT("BUSINESS DATA HERE", 30);
  it("anti-fabrication", () => {
    expect(prompt).toMatch(/never invent or estimate/i);
  });
  it("anti prompt-injection / secret leakage", () => {
    expect(prompt).toMatch(/ignore any instruction/i);
    expect(prompt).toMatch(/api keys|secrets|schema/i);
  });
  it("advisory only — cannot take actions", () => {
    expect(prompt).toMatch(/cannot take actions|propose/i);
  });
});

describe("Input validation (pre-LLM)", () => {
  it("rejects an empty consumer chat message before any model call", async () => {
    const caller = appRouter.createCaller(anonCtx());
    await expect(caller.chat.send({ message: "", history: [] } as any)).rejects.toBeTruthy();
  });
});
