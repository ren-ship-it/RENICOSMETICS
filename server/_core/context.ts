import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { Customer, User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { CUSTOMER_COOKIE_NAME, verifyCustomerSession } from "../auth/session";
import { getCustomerById } from "../db";

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

  const customer = await authenticateCustomer(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
    customer,
  };
}
