import { test, expect } from "@playwright/test";

const E2E_EMAIL = "playwright-e2e@example.local";
const E2E_PASSWORD = "Playwright_e2e_pass_9";

test.describe.configure({ mode: "serial" });

test.describe("Todo app end-to-end", () => {
  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/auth/sign-up/email", {
      data: {
        name: "Playwright E2E",
        email: E2E_EMAIL,
        password: E2E_PASSWORD,
      },
      headers: { Origin: "http://localhost:3000" },
    });
    if (res.ok()) return;
    const body = await res.text();
    if (
      res.status() === 422 ||
      body.toLowerCase().includes("already") ||
      body.toLowerCase().includes("exists")
    ) {
      return;
    }
    throw new Error(`sign-up failed: ${res.status()} ${body}`);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel("Password").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await expect(page.getByPlaceholder("What needs to be done?")).toBeVisible();
  });

  test("create task with details, filter, toggle complete, delete", async ({
    page,
  }) => {
    const title = `E2E task ${Date.now()}`;

    const input = page.getByPlaceholder("What needs to be done?");
    await input.fill(title);
    await expect(page.getByText("Due date", { exact: true })).toBeVisible();

    await page.getByLabel("New task due date").fill("2099-12-31");
    await page.getByLabel("New task priority").selectOption("HIGH");
    await page.getByLabel("New task important (star)").click();

    const labelField = page.getByLabel("New task label");
    await labelField.fill("e2e-label");
    await labelField.press("Enter");

    await page.getByRole("button", { name: "Add" }).click();
    const taskList = page.getByRole("list", { name: "Task list" });
    await expect(taskList.getByText(title, { exact: true })).toBeVisible();
    await expect(input).toHaveValue("");

    await expect(taskList.getByText("HIGH")).toBeVisible();
    await expect(taskList.getByText("e2e-label")).toBeVisible();
    await expect(
      taskList.getByRole("button", { name: "Remove from important" })
    ).toBeVisible();

    await expect(page.getByText("Filter list")).toBeVisible();
    await page.getByTestId("filter-starred-only").click();
    await expect(taskList.getByText(title, { exact: true })).toBeVisible();

    await page.getByLabel("Filter by label").selectOption("e2e-label");
    await expect(taskList.getByText(title, { exact: true })).toBeVisible();

    await page.getByLabel("Filter by label").selectOption("");
    await page.getByTestId("filter-starred-only").click();
    await page.getByLabel("Filter by completion status").selectOption("all");
    await taskList.getByRole("button", { name: "Mark as complete" }).click();
    await expect(taskList.getByText(title, { exact: true })).toBeVisible();

    await taskList.getByText(title, { exact: true }).hover();
    await taskList.getByRole("button", { name: "Delete task" }).click({
      force: true,
    });
    await expect(taskList.getByText(title, { exact: true })).toHaveCount(0);
  });
});
