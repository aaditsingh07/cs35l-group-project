const { test, expect } = require("@playwright/test");

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/localhost:3000/);
});

test("meetings route is reachable", async ({ page }) => {
  await page.goto("/meetings");
  await expect(page.locator("body")).toBeVisible();
});

test("group message sent by Alice appears for Bob", async ({ browser }) => {
  const alice = await browser.newContext();
  const alicePage = await alice.newPage();

  await alicePage.goto("http://localhost:3000/login");

  await alicePage.fill("#email", "alice@example.com");
  await alicePage.fill("#password", "alice");
  await alicePage.getByRole("button", { name: "Sign In" }).click();

  await alicePage.waitForTimeout(2000);

  await alicePage.goto("http://localhost:3000/messages");

  await expect(
    alicePage.getByText("Create Conversation")
  ).toBeVisible();

  await alicePage.locator("text=Group Chat").first().click();

  const msg = `Group Test ${Date.now()}`;

  await alicePage
    .getByPlaceholder("Type a message...")
    .fill(msg);

  await alicePage
    .getByRole("button", { name: "Send" })
    .click();

  const bob = await browser.newContext();
  const bobPage = await bob.newPage();

  await bobPage.goto("http://localhost:3000/login");

  await bobPage.fill("#email", "bob@example.com");
  await bobPage.fill("#password", "bob");
  await bobPage.getByRole("button", { name: "Sign In" }).click();

  await bobPage.waitForTimeout(2000);

  await bobPage.goto("http://localhost:3000/messages");

  await bobPage.locator("text=Group Chat").first().click();

  await expect(
    bobPage.getByText(msg)
  ).toBeVisible();

  await alice.close();
  await bob.close();
});

test("direct message creates notification for admin", async ({ browser }) => {
  const alice = await browser.newContext();
  const alicePage = await alice.newPage();

  await alicePage.goto("http://localhost:3000/login");

  await alicePage.fill("#email", "alice@example.com");
  await alicePage.fill("#password", "alice");
  await alicePage.getByRole("button", { name: "Sign In" }).click();

  await alicePage.waitForTimeout(2000);

  await alicePage.goto("http://localhost:3000/messages");

  await alicePage
    .getByText("Create Conversation")
    .click();

  await alicePage.selectOption("select", {
    label: "Admin",
  });

  await alicePage
    .getByRole("button", { name: /start/i })
    .click();

  await alicePage
    .getByText("Conversation with Admin")
    .click();

  const msg = `DM Test ${Date.now()}`;

  await alicePage
    .getByPlaceholder("Type a message...")
    .fill(msg);

  await alicePage
    .getByRole("button", { name: "Send" })
    .click();

  const admin = await browser.newContext();
  const adminPage = await admin.newPage();

  await adminPage.goto("http://localhost:3000/login");

  await adminPage.fill("#email", "admin@test.com");
  await adminPage.fill("#password", "password123");
  await adminPage.getByRole("button", { name: "Sign In" }).click();

  await adminPage.waitForTimeout(2000);

  await adminPage.goto("http://localhost:3000/messages");

  await adminPage
    .getByText("Conversation with Alice")
    .click();

  await expect(
    adminPage.getByText(msg)
  ).toBeVisible();

  await alice.close();
  await admin.close();
});