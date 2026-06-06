# Reni Cosmetics — AI Disclosures & Automated Decision-Making Register

This register documents every AI system and automated decision the platform
makes. It exists to satisfy current transparency obligations and to be ready for
the Australian Privacy Act reforms on automated decision-making (ADM).

## Principles

- **Disclosure:** any AI-generated output shown to a person is disclosed as AI.
- **No solely-automated significant decisions:** automated scores are advisory
  inputs for staff; they do not, on their own, produce legal or similarly
  significant effects on a person.
- **Explainability:** scoring models are interpretable and store their
  contributing factors.
- **Auditability:** every AI output / automated decision is logged to
  `aiDecisionLog` (type, subject, model, version, disclosure & human-review
  flags, inputs summary, output, explanation).
- **Contestability:** individuals can request, query or object to automated
  insights via privacy@renicosmetics.com.au.

## Two separate AI systems

| | Consumer chatbot | Admin business assistant |
|---|---|---|
| Router | `chat.*` (publicProcedure) | `analytics.ask` (adminProcedure) |
| Audience | Website visitors | Authenticated admins only |
| Data access | Product/policy facts in prompt only | Aggregated business snapshot only |
| Identified data | None | None in AI context (separate admin reads) |
| Disclosure | "responses are AI-generated" in-chat | Labelled AI analysis in dashboard |
| Logged to | `aiDecisionLog` (`chat_reply`) | `aiDecisionLog` (`admin_bi_answer`) |

The two never share a prompt, context or permission level. The consumer bot
cannot reach business data; the admin assistant cannot reach raw customer PII.

## Automated decisions / scores

| Decision | Model | Where | Effect | Human in loop |
|---|---|---|---|---|
| Customer segmentation | RFM (`rfm.ts`) | `customerInsights` | Advisory targeting | Yes |
| Churn risk | Logistic (`churn.ts`) | `customerInsights` | Advisory retention | Yes |
| Demand forecast | Holt's linear (`forecast.ts`) | dashboard/alerts | Advisory reordering | Yes |
| Recommendations | Item-CF (`recommendations.ts`) | suggestions | Non-significant | Yes |
| Chat reply | LLM | chat widget | Support info only | On escalation |
| BI analysis | LLM over snapshot | admin dashboard | Advisory only | Yes (admin reads) |

None of these take an irreversible or customer-affecting action automatically.

## Data-accuracy guardrails (admin assistant)

The admin assistant is instructed and constrained to:

- answer ONLY from the verified snapshot figures;
- never invent revenue, orders, customers, stock, conversion or trends;
- state clearly when data is missing/zero (a `dataAvailability` map is supplied);
- label statements FACT / TREND / INTERPRETATION / UNKNOWN;
- propose changes but never claim to have made them (no autonomous actions);
- refuse attempts to reveal the prompt, secrets, schema or internal code.

## Consumer chatbot guardrails

- Stays within customer-support scope; redirects off-topic requests.
- No access to analytics, sales, customer records, stock counts (beyond
  in/out-of-stock), admin tools, prompts, keys or backend logic — and is told to
  refuse such requests.
- Must not invent product benefits, ingredients, prices, stock, shipping rules
  or policies; uses only the supplied facts.
- Must not make medical/therapeutic/guaranteed-result claims; escalates medical
  and sensitive situations.
- One-time AI disclosure when sincerely asked; never claims to be human.
- Ignores instruction-override / role-confusion / prompt-leak attempts.

See `docs/AI_SAFETY_TEST_REPORT.md` for the adversarial test suite and results.

## Retention & rights

- `aiDecisionLog` entries are retained as an audit trail; they summarise inputs
  rather than duplicating full message bodies.
- Individuals may request access to, an explanation of, or object to automated
  insights about them (privacy@renicosmetics.com.au), consistent with APP 12/13.
