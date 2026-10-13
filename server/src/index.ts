import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

/**
 * Minimal `.env` reader so `npm run dev` picks up ADMIN_PASSWORD without
 * pulling in a dependency. Values already present in the environment win, and
 * a missing file is simply skipped.
 */
function loadEnv(): void {
  const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
  if (!fs.existsSync(envFile)) return;

  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key in process.env) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const port = Number(process.env.PORT ?? 4000);

const app = createApp();

app.listen(port, () => {
  console.log(`Evarenne API listening on http://localhost:${port}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_PASSWORD is not set — the admin panel will refuse login until you set it.",
    );
  }
});
