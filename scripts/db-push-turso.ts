import "dotenv/config";
import { execSync } from "child_process";
import { createClient } from "@libsql/client";

async function pushToTurso() {
  console.log("🚀 Sincronizando esquema de Prisma con Turso (libSQL)...");

  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("DATABASE_URL no está configurada en .env");
  }

  console.log(`📡 Conectando a Turso: ${url}`);
  const client = createClient({ url, authToken });

  console.log("📄 Generando sentencias SQL desde prisma/schema.prisma...");
  const sql = execSync("pnpm prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script", {
    env: { ...process.env, DATABASE_URL: "file:./dev.db" },
    encoding: "utf-8",
  });

  const cleanSql = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleanSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`⚡ Ejecutando ${statements.length} sentencias DDL en Turso...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
    } catch (err: unknown) {
      // Ignorar si el índice o tabla ya existe
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("already exists")) {
        console.warn(`[Aviso sentencia ${i + 1}]: ${msg}`);
      }
    }
  }

  console.log("✅ Esquema sincronizado exitosamente con Turso.");
  client.close();
}

pushToTurso().catch((err) => {
  console.error("❌ Error al sincronizar con Turso:", err);
  process.exit(1);
});
