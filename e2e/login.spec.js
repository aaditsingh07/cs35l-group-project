const { test, expect } = require("@playwright/test");

test("homepage loads", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/localhost:3000/);
});

test("meetings route is reachable", async ({ page }) => {
    await page.goto("/meetings");
  
    console.log(await page.title());
  
    await expect(page.locator("body")).toBeVisible();
  });