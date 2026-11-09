import express, { type ErrorRequestHandler } from "express";
import { config } from "./config.ts";
import { prisma } from "./db.ts";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    console.error("Health check: base de datos no disponible", err);
    res.status(503).json({ status: "degraded", db: "unavailable" });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "No encontrado" });
});


const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Error interno" });
};

app.use(errorHandler);
