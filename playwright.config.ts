import { defineConfig, devices } from "@playwright/test";

const PORT = 3333;
const BASE = `http://localhost:${PORT}`;

/** Inline env so `.env` (e.g. Turso) cannot override SQLite used for e2e. */
const e2eServerEnv =
  `DATABASE_URL=file:./prisma/dev.db ` +
  `BETTER_AUTH_SECRET=mock_secretmock_secretmock_secretmock_secretmock_secret ` +
  `BETTER_AUTH_URL=${BASE} ` +
  `GOOGLE_CLIENT_ID= GOOGLE_CLIENT_SECRET= TURSO_AUTH_TOKEN= ` +
  `PORT=${PORT} `;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    /** `next start` avoids the single `next dev` lock per project directory. */
    command: `${e2eServerEnv}npm run build && ${e2eServerEnv}npx next start -H localhost -p ${PORT}`,
    url: `${BASE}/login`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
