/**
 * Transactional email sender.
 *
 * Dependency-free: uses the Resend HTTP API when RESEND_API_KEY is set,
 * otherwise logs to the console so flows are testable before a provider is
 * configured. Never throws into the caller — email is best-effort.
 *
 * To go live: set RESEND_API_KEY (and optionally EMAIL_FROM). Swapping to SES
 * or another provider only requires changing `deliver()` below.
 */
import { ENV } from "../_core/env";
import type { EmailContent } from "./templates";

export interface SendEmailArgs extends EmailContent {
  to: string;
}

async function deliver(args: SendEmailArgs): Promise<boolean> {
  if (!ENV.resendApiKey) {
    console.log(`[Email] (not configured) would send "${args.subject}" to ${args.to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.emailFrom,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      console.warn(`[Email] provider error ${res.status}: ${await res.text().catch(() => "")}`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[Email] send failed:", e);
    return false;
  }
}

export async function sendEmail(args: SendEmailArgs): Promise<boolean> {
  return deliver(args);
}

/** Whether real email delivery is configured. */
export function isEmailConfigured(): boolean {
  return !!ENV.resendApiKey;
}

/** Build an absolute URL for links in emails. */
export function appOrigin(reqHost?: string, proto = "https"): string {
  if (ENV.appUrl) return ENV.appUrl.replace(/\/$/, "");
  if (reqHost) return `${proto}://${reqHost}`;
  return "https://renicosmetics.com.au";
}
