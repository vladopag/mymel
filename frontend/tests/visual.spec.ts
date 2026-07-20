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

  test('Add Media Modal Visual Screenshot', async ({ page }) => {
    // Mock authentication check
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER'
        })
      });
    });

    // Mock media list retrieval
    await page.route('**/api/v1/media', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Steins;Gate',
            type: 'ANIME',
            status: 'COMPLETED',
            rating: 10,
            personalNotes: 'Masterpiece!'
          }
        ])
      });
    });

    // Navigate to /library
    await page.goto('/library');

    // Click "+ Add Media"
    const addMediaButton = page.locator('button:has-text("+ Add Media")');
    await expect(addMediaButton).toBeVisible();
    await addMediaButton.click();

    // Wait for the modal content to be visible
    const modalContent = page.locator('.modal-content');
    await expect(modalContent).toBeVisible();

    // Assert visual layout of the modal
    await expect(page).toHaveScreenshot('add-media-modal.png', { maxDiffPixelRatio: 0.05 });
  });

  test('Quick Action Tracker Increments Episode Count', async ({ page }) => {
    // Mock authentication check
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER'
        })
      });
    });

    let patchedDelta = 0;

    // Mock media list retrieval
    await page.route('**/api/v1/media', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Frieren: Beyond Journey\'s End',
            type: 'ANIME',
            status: 'WATCHING',
            rating: 10,
            episodesWatched: patchedDelta > 0 ? 13 : 12,
            totalEpisodes: 28
          }
        ])
      });
    });

    // Mock PATCH episode quick tracker
    await page.route('**/api/v1/media/1/episodes*', async (route) => {
      const url = new URL(route.request().url());
      patchedDelta = parseInt(url.searchParams.get('delta') || '0', 10);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          title: 'Frieren: Beyond Journey\'s End',
          type: 'ANIME',
          status: 'WATCHING',
          rating: 10,
          episodesWatched: 13,
          totalEpisodes: 28
        })
      });
    });

    await page.goto('/library');

    const quickTracker = page.locator('.quick-tracker');
    await expect(quickTracker).toBeVisible();

    const incrementBtn = quickTracker.locator('button[aria-label="Increment episode"]');
    await expect(incrementBtn).toBeVisible();
    await incrementBtn.click();

    // Check count text updated to 13 / 28
    const countSpan = quickTracker.locator('.quick-tracker-count');
    await expect(countSpan).toHaveText('13 / 28');
    expect(patchedDelta).toBe(1);
  });
});
