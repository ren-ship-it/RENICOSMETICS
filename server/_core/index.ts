import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerStripeWebhook } from "../stripeWebhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security headers via Helmet — protects against common web vulnerabilities
  app.use(helmet({
    contentSecurityPolicy: false, // Managed by Vite/CDN layer in production
    crossOriginEmbedderPolicy: false,
  }));

  // Remove X-Powered-By header to avoid fingerprinting
  app.disable("x-powered-by");

  // Global rate limiter — 200 requests per 15 minutes per IP
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again shortly." },
    // Don't rate-limit OAuth or the Stripe webhook (Stripe retries from its own IPs).
    skip: (req) => req.path.startsWith("/api/oauth") || req.path === "/api/stripe/webhook",
  });
  app.use("/api", globalLimiter);

  // Stripe webhook MUST be registered with a raw body parser BEFORE express.json
  // so the signature can be verified against the unparsed payload.
  registerStripeWebhook(app);

  // Stricter rate limiter for chat endpoint — 20 per 10 minutes per IP
  const chatLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many messages. Please wait a moment before trying again." },
  });
  app.use("/api/trpc/chat", chatLimiter);

  // Strict limiter for auth endpoints — brute-force / credential-stuffing defence.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts. Please wait a few minutes and try again." },
  });
  app.use("/api/trpc/customerAuth", authLimiter);

  // Configure body parser with reasonable size limit
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ limit: "5mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
