# Reni Cosmetics — Internal Data Collection Register

> GENERATED FILE — do not edit by hand.
> Source: `shared/analytics/registry.ts`. Regenerate: `pnpm tsx scripts/genDataRegister.ts`.

Policy/registry version: **2026-06-06**

This is the internal record of processing activities (akin to a GDPR Art. 30 register, scoped to the Australian Privacy Act / APPs). It documents, for every data-collection module, its purpose, lawful basis, data classification, consent requirement, retention and whether it feeds automated decision-making.

## Summary

- Total modules: **17**
- Identified: 6 · Pseudonymised: 8 · Aggregated: 3
- Feeding automated decision-making: 5 (AI / Chat Interactions, Customer Segmentation, Stock Demand Forecasting, Predictive Churn Indicators, Product Recommendation Signals)

## Register

| Module | Purpose | Classification | Consent | Lawful basis | Retention | ADM |
|---|---|---|---|---|---|---|
| Purchase Behaviour | operational | identified | essential | APP 3 — reasonably necessary to fulfil the contract of sale; APP 6 — primary purpose. Tax records retained per AU law. | 2555 days | no |
| Product Views & Engagement | product | pseudonymised | analytics | APP 3 & APP 5 — collected with notice; consented analytics. | 395 days | no |
| Session Duration & Browsing Flows | analytical | pseudonymised | analytics | APP 3 & APP 5 — consented analytics. | 395 days | no |
| Cart Abandonment | marketing | pseudonymised | analytics | APP 3 — consented analytics. Identified abandonment reminders require APP 7 / Spam Act marketing consent. | 180 days | no |
| Search Behaviour | product | pseudonymised | analytics | APP 3 & APP 5 — consented analytics. | 395 days | no |
| Waitlist Engagement | operational | identified | essential | APP 3 — necessary to provide the requested notification; transactional, not marketing. | 730 days | no |
| AI / Chat Interactions | support | pseudonymised | essential | APP 3 — necessary to provide the support function; APP 5 — AI use disclosed in-chat. | 730 days | yes |
| Product Preferences | personalisation | pseudonymised | personalisation | APP 3 — consented personalisation; no sensitive information collected. | 395 days | no |
| Repeat Purchase Behaviour | analytical | identified | essential | APP 6 — derived from order records for a directly related secondary purpose. | derived/aggregated | no |
| Customer Segmentation | marketing | identified | essential | APP 6 — directly related secondary purpose. Segment-based marketing requires APP 7 consent. | derived/aggregated | yes |
| Device / Browser / Location Analytics | analytical | pseudonymised | analytics | APP 3 & APP 5 — consented analytics; IP is hashed, not stored raw. | 395 days | no |
| Conversion Funnels | analytical | aggregated | analytics | APP 3 — aggregated, non-identifying analytics. | derived/aggregated | no |
| Email / SMS Engagement | marketing | identified | marketing | Spam Act 2003 — express/inferred consent required; APP 7 direct marketing; unsubscribe honoured. | 1095 days | no |
| Stock Demand Forecasting | operational | aggregated | essential | APP 6 — operational use of aggregated sales data. | derived/aggregated | yes |
| Predictive Churn Indicators | marketing | identified | essential | APP 6 — directly related secondary purpose; outputs logged for ADM transparency (reform-ready). | derived/aggregated | yes |
| Product Recommendation Signals | personalisation | pseudonymised | personalisation | APP 3 — consented personalisation built on aggregated co-occurrence. | 395 days | yes |
| Support Trends & Recurring Concerns | support | aggregated | essential | APP 6 — operational quality-improvement use of support records. | derived/aggregated | no |

## Detail

### Purchase Behaviour (`purchase_behaviour`)

- **What is collected:** Completed orders, order value, basket composition, discount usage and purchase cadence.
- **Public-facing summary:** Your order history and purchase details, so we can fulfil orders, provide support and understand which products serve customers best.
- **Purpose:** operational
- **Classification:** identified
- **Consent category:** essential
- **Lawful basis:** APP 3 — reasonably necessary to fulfil the contract of sale; APP 6 — primary purpose. Tax records retained per AU law.
- **Event types:** purchase
- **Data points:** order value, items & quantities, discount code, order date
- **Retention:** 2555 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Product Views & Engagement (`product_engagement`)

- **What is collected:** Product detail views, image/gallery interactions, ingredient expander opens, dwell time per product.
- **Public-facing summary:** Which products and product information you view, so we can improve our pages and surface relevant products.
- **Purpose:** product
- **Classification:** pseudonymised
- **Consent category:** analytics
- **Lawful basis:** APP 3 & APP 5 — collected with notice; consented analytics.
- **Event types:** view_item, view_item_list, ingredient_expand, image_zoom
- **Data points:** product slug, list context, dwell time
- **Retention:** 395 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Session Duration & Browsing Flows (`session_flow`)

- **What is collected:** Page views, navigation paths, session duration, scroll depth and entry/exit pages.
- **Public-facing summary:** How you move through the site and how long you spend, so we can improve navigation and page layout.
- **Purpose:** analytical
- **Classification:** pseudonymised
- **Consent category:** analytics
- **Lawful basis:** APP 3 & APP 5 — consented analytics.
- **Event types:** page_view, session_start, session_end, scroll_depth
- **Data points:** path, referrer, duration, scroll %
- **Retention:** 395 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Cart Abandonment (`cart_abandonment`)

- **What is collected:** Add-to-cart, cart updates, checkout starts and whether checkout completed.
- **Public-facing summary:** When items are added to your cart and whether checkout was completed, so we can reduce friction and (with consent) send reminders.
- **Purpose:** marketing
- **Classification:** pseudonymised
- **Consent category:** analytics
- **Lawful basis:** APP 3 — consented analytics. Identified abandonment reminders require APP 7 / Spam Act marketing consent.
- **Event types:** add_to_cart, remove_from_cart, begin_checkout, checkout_abandoned
- **Data points:** cart items, cart value, checkout step reached
- **Retention:** 180 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Search Behaviour (`search_behaviour`)

- **What is collected:** On-site search terms, result counts and zero-result searches.
- **Public-facing summary:** What you search for on our site, so we can improve search results and identify products customers want.
- **Purpose:** product
- **Classification:** pseudonymised
- **Consent category:** analytics
- **Lawful basis:** APP 3 & APP 5 — consented analytics.
- **Event types:** search, search_no_results, search_result_click
- **Data points:** query text, result count, clicked result
- **Retention:** 395 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Waitlist Engagement (`waitlist_engagement`)

- **What is collected:** Out-of-stock notify-me sign-ups and conversion from waitlist to purchase.
- **Public-facing summary:** When you ask to be notified about an out-of-stock product, so we can let you know and gauge demand.
- **Purpose:** operational
- **Classification:** identified
- **Consent category:** essential
- **Lawful basis:** APP 3 — necessary to provide the requested notification; transactional, not marketing.
- **Event types:** waitlist_join, waitlist_convert
- **Data points:** email, product slug, notified status
- **Retention:** 730 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### AI / Chat Interactions (`ai_chat_interactions`)

- **What is collected:** Conversations with the Reni assistant, escalation flags and (if voluntarily given) contact details.
- **Public-facing summary:** Your conversations with our AI assistant, so we can answer your questions, improve responses and follow up if needed. Responses are AI-generated and disclosed as such.
- **Purpose:** support
- **Classification:** pseudonymised
- **Consent category:** essential
- **Lawful basis:** APP 3 — necessary to provide the support function; APP 5 — AI use disclosed in-chat.
- **Event types:** chat_message, chat_escalation
- **Data points:** message text, persona, escalation flag, optional email
- **Retention:** 730 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** yes — see docs/AI_AND_AUTOMATED_DECISIONS.md

### Product Preferences (`product_preferences`)

- **What is collected:** Inferred preferences from quiz answers, viewed pathways and purchased mechanisms.
- **Public-facing summary:** Preferences you tell us (e.g. via the skin quiz) or that we infer from your activity, so we can recommend suitable products.
- **Purpose:** personalisation
- **Classification:** pseudonymised
- **Consent category:** personalisation
- **Lawful basis:** APP 3 — consented personalisation; no sensitive information collected.
- **Event types:** quiz_complete, preference_signal
- **Data points:** skin concern (non-sensitive), preferred pathway, routine step
- **Retention:** 395 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Repeat Purchase Behaviour (`repeat_purchase`)

- **What is collected:** Inter-purchase intervals, reorder rates and product replenishment patterns.
- **Public-facing summary:** Patterns in your repeat purchases, so we can time helpful reminders and keep popular products in stock.
- **Purpose:** analytical
- **Classification:** identified
- **Consent category:** essential
- **Lawful basis:** APP 6 — derived from order records for a directly related secondary purpose.
- **Event types:** (derived — no client events)
- **Data points:** order sequence, days between orders, reorder rate
- **Retention:** derived/aggregated; governed by source-record retention
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Customer Segmentation (`customer_segmentation`)

- **What is collected:** RFM (recency / frequency / monetary) scoring and behavioural segment assignment.
- **Public-facing summary:** Grouping customers into segments (e.g. new, loyal, lapsing) based on purchase patterns, so our communications and offers stay relevant.
- **Purpose:** marketing
- **Classification:** identified
- **Consent category:** essential
- **Lawful basis:** APP 6 — directly related secondary purpose. Segment-based marketing requires APP 7 consent.
- **Event types:** (derived — no client events)
- **Data points:** RFM scores, segment label, lifetime value
- **Retention:** derived/aggregated; governed by source-record retention
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** yes — see docs/AI_AND_AUTOMATED_DECISIONS.md

### Device / Browser / Location Analytics (`device_location`)

- **What is collected:** Device type, browser, operating system and coarse geographic region (country / state).
- **Public-facing summary:** Your device, browser and approximate location (country/state level only), so the site works across devices and we understand our audience. We do not track precise location.
- **Purpose:** analytical
- **Classification:** pseudonymised
- **Consent category:** analytics
- **Lawful basis:** APP 3 & APP 5 — consented analytics; IP is hashed, not stored raw.
- **Event types:** device_context
- **Data points:** device type, browser, OS, country, state, hashed IP
- **Retention:** 395 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Conversion Funnels (`conversion_funnels`)

- **What is collected:** Step-by-step conversion from view → add-to-cart → checkout → purchase.
- **Public-facing summary:** How visitors progress from browsing to purchase, in aggregate, so we can find and fix drop-off points.
- **Purpose:** analytical
- **Classification:** aggregated
- **Consent category:** analytics
- **Lawful basis:** APP 3 — aggregated, non-identifying analytics.
- **Event types:** (derived — no client events)
- **Data points:** funnel step counts, step conversion rates
- **Retention:** derived/aggregated; governed by source-record retention
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Email / SMS Engagement (`email_sms_engagement`)

- **What is collected:** Subscription status, opens, clicks and unsubscribes for marketing messages.
- **Public-facing summary:** Whether you open or click our emails/SMS (if you have subscribed), so we can measure and improve our communications. You can unsubscribe at any time.
- **Purpose:** marketing
- **Classification:** identified
- **Consent category:** marketing
- **Lawful basis:** Spam Act 2003 — express/inferred consent required; APP 7 direct marketing; unsubscribe honoured.
- **Event types:** email_open, email_click, sms_click, unsubscribe
- **Data points:** subscriber email, campaign id, open/click, consent state
- **Retention:** 1095 days
- **Default enabled:** no
- **Sidekick access:** aggregated
- **Automated decision-making:** no

### Stock Demand Forecasting (`stock_demand_forecasting`)

- **What is collected:** Projected demand per product from sales history, used for reorder planning.
- **Public-facing summary:** We forecast product demand from aggregate sales to keep items in stock. This uses sales totals, not your identity.
- **Purpose:** operational
- **Classification:** aggregated
- **Consent category:** essential
- **Lawful basis:** APP 6 — operational use of aggregated sales data.
- **Event types:** (derived — no client events)
- **Data points:** daily/weekly units sold, trend, days of cover
- **Retention:** derived/aggregated; governed by source-record retention
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** yes — see docs/AI_AND_AUTOMATED_DECISIONS.md

### Predictive Churn Indicators (`churn_prediction`)

- **What is collected:** Per-customer churn risk score derived from recency, frequency and value signals.
- **Public-facing summary:** We estimate which customers may be lapsing, so we can offer timely, relevant support and offers. This is an automated estimate; you can ask us about or object to it.
- **Purpose:** marketing
- **Classification:** identified
- **Consent category:** essential
- **Lawful basis:** APP 6 — directly related secondary purpose; outputs logged for ADM transparency (reform-ready).
- **Event types:** (derived — no client events)
- **Data points:** churn score, risk band, contributing factors
- **Retention:** derived/aggregated; governed by source-record retention
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** yes — see docs/AI_AND_AUTOMATED_DECISIONS.md

### Product Recommendation Signals (`product_recommendations`)

- **What is collected:** Co-purchase / co-view item similarity used to power 'goes well with' suggestions.
- **Public-facing summary:** Suggestions based on what is commonly bought or viewed together, so we can recommend products that complement your routine.
- **Purpose:** personalisation
- **Classification:** pseudonymised
- **Consent category:** personalisation
- **Lawful basis:** APP 3 — consented personalisation built on aggregated co-occurrence.
- **Event types:** recommendation_view, recommendation_click
- **Data points:** item-item similarity, recommendation slot, click
- **Retention:** 395 days
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** yes — see docs/AI_AND_AUTOMATED_DECISIONS.md

### Support Trends & Recurring Concerns (`support_trends`)

- **What is collected:** Themes and recurring issues across chat logs and contact messages, in aggregate.
- **Public-facing summary:** Common themes in support enquiries, so we can fix recurring issues and improve our help content. Analysed in aggregate.
- **Purpose:** support
- **Classification:** aggregated
- **Consent category:** essential
- **Lawful basis:** APP 6 — operational quality-improvement use of support records.
- **Event types:** (derived — no client events)
- **Data points:** theme, frequency, escalation rate
- **Retention:** derived/aggregated; governed by source-record retention
- **Default enabled:** yes
- **Sidekick access:** aggregated
- **Automated decision-making:** no
