import { test, expect } from '@playwright/test';

test.describe('Slider Captcha Registration Flow', () => {
  const dummyPngData = [
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
    0, 0, 0, 1, 8, 4, 0, 0, 0, 181, 28, 12, 2, 0, 0, 0, 11, 73, 68, 65, 84,
    120, 218, 99, 100, 96, 0, 0, 0, 6, 0, 2, 48, 129, 208, 47, 0, 0, 0
  ];

  test('Fails registration when captcha is not completed', async ({ page }) => {
    await page.goto('/register');

    // Fill in credentials
    await page.locator('#username').fill('newuser');
    await page.locator('#email').fill('newuser@example.com');
    await page.locator('#password').fill('password123');

    // Click submit without doing captcha
    await page.locator('button[type="submit"]').click();

    // Verify error message
    const errorMsg = page.locator('text=Please verify you are human by completing the captcha');
    await expect(errorMsg).toBeVisible();
  });

  test('Renders captcha, solves challenge, and registers successfully', async ({ page }) => {
    // Mock captcha create
    await page.route('**/api/v1/captcha/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          challengeId: 'test-challenge-123',
          background: { type: 'Buffer', data: dummyPngData },
          slider: { type: 'Buffer', data: dummyPngData },
          backgroundDataUri: 'data:image/png;base64,dummy',
          sliderDataUri: 'data:image/png;base64,dummy',
          yOffset: 30
        })
      });
    });

    // Mock captcha verify
    await page.route('**/api/v1/captcha/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: 'success',
          token: 'verified-token-xyz'
        })
      });
    });

    let submittedRegisterBody: { username?: string; email?: string; password?: string; captchaToken?: string } = {};

    // Mock register endpoint
    await page.route('**/api/v1/auth/register', async (route) => {
      submittedRegisterBody = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 42,
          username: 'validuser',
          email: 'valid@example.com',
          role: 'USER'
        })
      });
    });

    // Mock /auth/me for redirection to /library
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 42,
          username: 'validuser',
          email: 'valid@example.com',
          role: 'USER'
        })
      });
    });

    // Mock media list for library page
    await page.route('**/api/v1/media', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/register');

    // Fill form
    await page.locator('#username').fill('validuser');
    await page.locator('#email').fill('valid@example.com');
    await page.locator('#password').fill('securepass123');

    // Anchor container is visible
    const anchor = page.locator('.scaptcha-anchor-container');
    await expect(anchor).toBeVisible();
    await expect(anchor).toContainText('I am human');

    // Click checkbox / anchor to open slider puzzle card
    await anchor.click();

    // Verify card opened with slider challenge
    const card = page.locator('.scaptcha-card-container');
    await expect(card).toBeVisible();

    const sliderControl = page.locator('.scaptcha-card-slider-control');
    await expect(sliderControl).toBeVisible();

    // Drag slider control
    const box = await sliderControl.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();
    }

    // Wait for verified callback to complete (500ms delay in component)
    await page.waitForTimeout(600);

    // Submit registration
    await page.locator('button[type="submit"]').click();

    // Verify payload sent to /auth/register
    expect(submittedRegisterBody.username).toBe('validuser');
    expect(submittedRegisterBody.email).toBe('valid@example.com');
    expect(submittedRegisterBody.captchaToken).toBe('verified-token-xyz');

    // Verify navigation to /library
    await expect(page).toHaveURL(/.*library/);
  });
});
