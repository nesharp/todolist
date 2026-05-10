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

    await page.getByRole("button", { name: "Add", exact: true }).click();
    const taskList = page.getByRole("list", { name: "Task list" });
    const taskItem = taskList.locator("li").filter({ hasText: title });
    await expect(taskItem).toBeVisible();
    await expect(input).toHaveValue("");

    await expect(taskItem.getByText("HIGH")).toBeVisible();
    await expect(taskItem.getByText("e2e-label").first()).toBeVisible();
    await expect(
      taskItem.getByRole("button", { name: "Remove from important" }).first()
    ).toBeVisible();

    await expect(page.getByText("Filter list")).toBeVisible();
    await page.getByTestId("filter-starred-only").click();
    await expect(taskItem).toBeVisible();

    await page.getByLabel("Filter by label").selectOption("e2e-label");
    await expect(taskItem).toBeVisible();

    await page.getByLabel("Filter by label").selectOption("");
    await page.getByTestId("filter-starred-only").click();
    await page.getByLabel("Filter by completion status").selectOption("all");
    await taskItem.getByRole("button", { name: "Mark as complete" }).click();
    await expect(taskItem).toBeVisible();

    await taskItem.hover();
    await taskItem.getByRole("button", { name: "Delete task" }).click({
      force: true,
    });
    await expect(taskItem).toHaveCount(0);
  });

  test("create project, add task in project, task not listed in Inbox", async ({
    page,
  }) => {
    const projectName = `E2E project ${Date.now()}`;
    const taskTitle = `E2E project task ${Date.now()}`;

    await page.getByRole("button", { name: "New Project" }).click();
    await page.getByTestId("new-project-name").fill(projectName);
    await page.getByTestId("new-project-submit").click();
    await page.waitForURL((url) => url.searchParams.has("project"));

    await expect(
      page.getByRole("heading", { level: 2, name: projectName })
    ).toBeVisible();

    const input = page.getByPlaceholder("What needs to be done?");
    await input.fill(taskTitle);
    await page.getByRole("button", { name: "Add", exact: true }).click();

    const taskList = page.getByRole("list", { name: "Task list" });
    await expect(taskList.getByText(taskTitle, { exact: true })).toBeVisible();

    await page.getByRole("navigation", { name: "Projects" }).getByRole("link", { name: "Inbox" }).click();
    await page.waitForURL((url) => !url.searchParams.has("project"));

    await expect(
      page.getByRole("heading", { level: 2, name: "Inbox" })
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Task list" }).getByText(taskTitle, {
        exact: true,
      })
    ).toHaveCount(0);
  });

  test("focus timer starts and shows Focus phase", async ({ page }) => {
    const card = page.getByTestId("focus-timer-card");
    await expect(card).toBeVisible();
    await expect(card.getByText("Ready", { exact: true })).toBeVisible();
    await card.getByRole("button", { name: "Start", exact: true }).click();
    await expect(card.getByText("Focus", { exact: true })).toBeVisible();
  });
});
