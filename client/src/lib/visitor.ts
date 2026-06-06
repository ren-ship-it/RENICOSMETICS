/**
 * Pseudonymous visitor & session identifiers.
 *
 * - visitorId: a random id persisted in localStorage. It is NOT derived from any
 *   personal information and can be cleared by the user at any time (clearing
 *   site data or via "reset" below). It lets us join a person's events across
 *   sessions without knowing who they are.
 * - sessionId: a random id per browser session (sessionStorage), used to measure
 *   session-level metrics like duration and pages-per-session.
 */
const VISITOR_KEY = "reni_visitor_id";
const SESSION_KEY = "reni_session_id";

function randomId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}_${rand}`;
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId("v");
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = randomId("s");
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** Forget the pseudonymous visitor id (e.g. on consent withdrawal). */
export function resetVisitorId(): void {
  try {
    localStorage.removeItem(VISITOR_KEY);
  } catch {
    /* ignore */
  }
}
