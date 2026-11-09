import "dotenv/config";
import { app } from "./app.ts";
import { config } from "./config.ts";
import { prisma } from "./db.ts";

const server = app.listen(config.port, config.host, (error?: Error) => {
  if (error) {
    console.error("No se pudo iniciar el servidor", error);
    process.exit(1);
  }
  console.log(`scholar-api escuchando en ${config.host}:${config.port} (${config.nodeEnv})`);
});

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} recibido, cerrando...`);

  // Si algo se queda colgado, forzar la salida a los 10 s
  setTimeout(() => process.exit(1), 10_000).unref();

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
