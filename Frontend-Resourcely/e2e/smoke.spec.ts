import { test, expect } from '@playwright/test';

// Basic smoke test to ensure the app renders
test('home loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
  