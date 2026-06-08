/**
 * AI edit proposals — approval queue (human-in-the-loop).
 *
 * The admin describes a change; the AI returns a STRUCTURED proposal (validated
 * against a strict schema) which is stored as `pending`. Nothing changes until an
 * admin approves it, at which point the constrained mutation is applied. This is
 * the safe "propose, don't perform" model the brief asks for.
 */
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb, getProductBySlug, updateProduct, getPublicProducts } from "../db";
import { aiProposals, journalPosts } from "../../drizzle/schema";
import { logAiDecision } from "../analytics/decisionLog";

// Constrained set of changes the AI may propose.
const productUpdate = z.object({
  type: z.literal("product_update"),
  slug: z.string().min(1),
  fields: z
    .object({
      price: z.union([z.number(), z.string()]).optional(),
      description: z.string().optional(),
      tagline: z.string().optional(),
      available: z.boolean().optional(),
      badge: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      howToUse: z.string().optional(),
    })
    .refine(f => Object.keys(f).length > 0, "No fields to update"),
  summary: z.string().max(500),
});
const journalUpsert = z.object({
  type: z.literal("journal_upsert"),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  summary: z.string().max(500),
});
const proposalSchema = z.discriminatedUnion("type", [productUpdate, journalUpsert]);
type Proposal = z.infer<typeof proposalSchema>;

const SYSTEM = (slugs: string[]) => `
You convert an admin's request into ONE structured content/catalogue change for
the Reni Cosmetics store. Output ONLY a single JSON object, no prose, no code
fences.

Allowed shapes:
1) {"type":"product_update","slug":"<existing-slug>","fields":{ ... },"summary":"..."}
   fields may include: price (number), description, tagline, available (boolean),
   badge, metaTitle, metaDescription, howToUse.
2) {"type":"journal_upsert","slug":"<kebab-slug>","title":"...","category":"...",
   "excerpt":"...","content":"...","status":"draft|published","summary":"..."}

Rules:
- Use ONLY existing product slugs for product_update: ${slugs.join(", ") || "(none)"}.
- Never invent prices/claims; if the request is ambiguous, unsafe, or not one of
  the allowed shapes, output exactly {"type":"none"}.
- Do not make medical/therapeutic claims. Keep copy on-brand and factual.
- "summary" is a one-line human description of the change for the approver.
`;

function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function applyProposal(p: Proposal): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (p.type === "product_update") {
    const product = await getProductBySlug(p.slug);
    if (!product) throw new Error(`Product not found: ${p.slug}`);
    const fields: Record<string, unknown> = { ...p.fields };
    if (fields.price !== undefined) fields.price = String(Number(fields.price).toFixed(2));
    await updateProduct(product.id, fields as any);
    return `Updated product ${p.slug}`;
  }
  // journal_upsert
  const values = {
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    content: p.content,
    status: p.status,
    publishedAt: p.status === "published" ? new Date() : null,
  };
  const { slug, ...rest } = values;
  await db.insert(journalPosts).values(values).onDuplicateKeyUpdate({ set: rest });
  return `Saved journal post ${p.slug} (${p.status})`;
}

export const aiProposalsRouter = router({
  list: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected", "applied", "failed", "all"]).default("pending") }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const status = input?.status ?? "pending";
      let q = db.select().from(aiProposals).$dynamic();
      if (status !== "all") q = q.where(eq(aiProposals.status, status as any));
      return q.orderBy(desc(aiProposals.createdAt)).limit(100);
    }),

  // Ask the AI to draft a proposal (stored pending; NOT applied).
  propose: adminProcedure
    .input(z.object({ instruction: z.string().min(4).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const products = await getPublicProducts().catch(() => []);
      const slugs = products.map(p => p.slug);

      let parsed: unknown;
      try {
        const res = await invokeLLM({
          messages: [
            { role: "system", content: SYSTEM(slugs) },
            { role: "user", content: input.instruction },
          ],
        });
        parsed = extractJson(typeof res.choices?.[0]?.message?.content === "string" ? (res.choices[0].message.content as string) : "");
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI is temporarily unavailable." });
      }

      if (parsed && (parsed as any).type === "none") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not produce a safe, specific proposal. Try rephrasing." });
      }
      const result = proposalSchema.safeParse(parsed);
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "The AI did not return a valid proposal. Try rephrasing." });
      }

      const [inserted] = await db
        .insert(aiProposals)
        .values({
          type: result.data.type,
          summary: result.data.summary,
          payload: result.data,
          status: "pending",
          createdBy: ctx.user.openId,
          instruction: input.instruction,
        })
        .$returningId?.() ?? [{ id: 0 }];

      await logAiDecision({
        decisionType: "edit_proposal",
        subjectType: "admin",
        subjectId: ctx.user.openId,
        modelId: "reni-edit-proposer",
        disclosed: true,
        humanReviewable: true,
        inputsSummary: { instruction: input.instruction.slice(0, 200) },
        output: { type: result.data.type, summary: result.data.summary },
        explanation: "AI drafted a structured edit proposal. Stored pending; applied only on explicit admin approval.",
      }).catch(() => {});

      return { ok: true, id: inserted?.id, summary: result.data.summary };
    }),

  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [row] = await db.select().from(aiProposals).where(eq(aiProposals.id, input.id)).limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      if (row.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Already decided." });

      const result = proposalSchema.safeParse(row.payload);
      if (!result.success) {
        await db.update(aiProposals).set({ status: "failed", resultNote: "Invalid stored payload", decidedAt: new Date() }).where(eq(aiProposals.id, input.id));
        throw new TRPCError({ code: "BAD_REQUEST", message: "Stored proposal is invalid." });
      }
      try {
        const note = await applyProposal(result.data);
        await db.update(aiProposals).set({ status: "applied", resultNote: note, decidedAt: new Date() }).where(eq(aiProposals.id, input.id));
        return { ok: true, note };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "apply failed";
        await db.update(aiProposals).set({ status: "failed", resultNote: msg, decidedAt: new Date() }).where(eq(aiProposals.id, input.id));
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msg });
      }
    }),

  reject: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(aiProposals).set({ status: "rejected", decidedAt: new Date() }).where(eq(aiProposals.id, input.id));
    return { ok: true };
  }),
});
