import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { Customer, User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { CUSTOMER_COOKIE_NAME, verifyCustomerSession } from "../auth/session";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "../auth/adminSession";
import { getCustomerById, getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  /** Admin / owner (Manus OAuth). */
  user: User | null;
  /** Authenticated storefront customer (first-party session). */
  customer: Customer | null;
};

async function authenticateCustomer(
  req: CreateExpressContextOptions["req"],
): Promise<Customer | null> {
  try {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const token = cookies[CUSTOMER_COOKIE_NAME];
    if (!token) return null;
    const session = await verifyCustomerSession(token);
    if (!session) return null;
    const customer = await getCustomerById(session.customerId);
    return customer ?? null;
  } catch {
    return null;
  }
}

async function authenticateAdmin(
  req: CreateExpressContextOptions["req"],
): Promise<User | null> {
  try {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const token = cookies[ADMIN_COOKIE_NAME];
    if (!token) return null;
    const userId = await verifyAdminSession(token);
    if (!userId) return null;
    const user = await getUserById(userId);
    // Only honour the session if the account is still an admin.
    return user && user.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Fall back to the first-party admin session if Manus OAuth didn't resolve.
  if (!user) {
    user = await authenticateAdmin(opts.req);
  }

  const customer = await authenticateCustomer(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
    customer,
  };
}
