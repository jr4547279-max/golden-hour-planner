import { createExpressApp } from "../server/_core/index";

export default async function handler(req: any, res: any) {
  try {
    const { app } = await createExpressApp();
    return app(req, res);
  } catch (error) {
    console.error("[Vercel Handler Error]:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
    });
  }
}
