import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./context";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust Replit's reverse proxy so req.protocol reflects HTTPS —
// critical for Set-Cookie Secure + SameSite=None to work in production.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// CORS: only allow requests from origins that are either localhost (dev) or
// ending in known Replit domains. Credentials are needed for cookie auth.
function isTrustedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  if (origin.endsWith(".replit.dev")) return true;
  if (origin.endsWith(".repl.co")) return true;
  if (origin.endsWith(".replit.app")) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || isTrustedOrigin(origin)) {
        cb(null, origin ?? "*");
      } else {
        cb(new Error(`CORS: origin not allowed: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
