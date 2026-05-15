import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./context";
import { logger } from "./lib/logger";
import { registerOAuthRoutes } from "./oauth";

const app: Express = express();

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

// Build an explicit allowlist of trusted origins at startup.
// We include localhost for dev and the specific Replit dev/prod domains.
const TRUSTED_ORIGINS = new Set<string>(
  [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:18245",
    process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : null,
    process.env.VITE_APP_URL ?? null,
  ].filter(Boolean) as string[]
);

// Also allow any origin that matches localhost on any port (dev convenience).
function isTrustedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  if (TRUSTED_ORIGINS.has(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || isTrustedOrigin(origin)) {
        cb(null, origin ?? "*");
      } else {
        cb(new Error(`CORS: untrusted origin: ${origin}`));
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

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
