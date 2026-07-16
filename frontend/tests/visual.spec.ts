import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('Home Page Visual Screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home-page.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Library Page Visual Screenshot (Redirects to Login)', async ({ page }) => {
    await page.goto('/library');
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixelRatio: 0.05 });
  });
});
