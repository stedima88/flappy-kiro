'use strict';
// End-to-end tests. The game is loaded straight from disk (file://), which also proves NFR-1.4.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test, expect } = require('@playwright/test');

const GAME_URL = pathToFileURL(path.join(__dirname, '..', '..', 'index.html')).href;
const stage = (page) => page.getByTestId('game-stage');

async function open(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(GAME_URL);
  await expect(page.getByTestId('start-screen')).toBeVisible();
  return errors;
}

async function crashIntoGround(page) {
  await expect(stage(page)).toHaveAttribute('data-state', 'GAME_OVER', { timeout: 5000 });
}

test('start screen shows the title, controls and high score (FR-7.1)', async ({ page }) => {
  const errors = await open(page);
  await expect(page.getByRole('heading', { name: 'Flappy Kiro' })).toBeVisible();
  await expect(page.getByTestId('start-screen-high-score')).toHaveText('High score: 0');
  await expect(stage(page)).toHaveAttribute('data-state', 'START');
  expect(errors).toEqual([]);
});

test('Space starts the game, falling ends it, Space restarts after the cooldown (FR-7, FR-6.5)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Space');
  await expect(stage(page)).toHaveAttribute('data-state', 'PLAYING');
  await expect(page.getByTestId('start-screen')).toBeHidden();
  await crashIntoGround(page);
  await expect(page.getByTestId('gameover-screen')).toBeVisible();
  await expect(page.getByTestId('gameover-screen-score')).toHaveText('Score: 0');
  await page.waitForTimeout(600); // restart cooldown
  await page.keyboard.press('Space');
  await expect(stage(page)).toHaveAttribute('data-state', 'PLAYING');
});

test('a mouse click also flaps and starts the game (FR-2.1)', async ({ page }) => {
  await open(page);
  // click the start overlay outside its panel, as a player would
  await page.getByTestId('start-screen').click({ position: { x: 20, y: 20 } });
  await expect(stage(page)).toHaveAttribute('data-state', 'PLAYING');
});

test('P pauses and Esc resumes, the pause button works too (FR-7.3, FR-2.4)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(stage(page)).toHaveAttribute('data-state', 'PLAYING');
  await page.getByTestId('hud-pause-button').click();
  await expect(page.getByTestId('pause-screen')).toBeVisible();
  await page.getByTestId('pause-screen-resume-button').click();
  await expect(stage(page)).toHaveAttribute('data-state', 'PLAYING');
});

test('the game pauses by itself when the tab is hidden (NFR-6.4)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Space');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(stage(page)).toHaveAttribute('data-state', 'PAUSED');
});

test('a new high score is saved and survives a reload (FR-5)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Space');
  await page.evaluate(() => {
    window.FlappyKiro.app.game.score = 3; // stand-in for passing three pairs
  });
  await crashIntoGround(page);
  await expect(page.getByTestId('gameover-screen-new-high')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('start-screen-high-score')).toHaveText('High score: 3');
});

test('a corrupted stored high score is treated as 0 (FR-5.3)', async ({ page }) => {
  await open(page);
  await page.evaluate(() => localStorage.setItem('flappyKiro.highScore', 'not-a-number'));
  await page.reload();
  await expect(page.getByTestId('start-screen-high-score')).toHaveText('High score: 0');
});

test('settings: sound and motion toggles are saved (FR-12.3, FR-12.4)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('KeyS');
  const menu = page.getByTestId('settings-menu');
  await expect(menu).toBeVisible();
  await page.getByTestId('settings-menu-sound-toggle').click();
  await expect(page.getByTestId('settings-menu-sound-toggle')).toHaveText('Sound: Off');
  await expect(page.getByTestId('hud-mute-button')).toHaveAttribute('aria-label', 'Unmute sound');
  await page.getByTestId('settings-menu-motion-toggle').click();
  await expect(page.getByTestId('settings-menu-motion-toggle')).toHaveText('Motion: Reduced');
  await page.reload();
  await expect(stage(page)).toHaveAttribute('data-muted', 'true');
  await expect(stage(page)).toHaveAttribute('data-motion', 'reduced');
});

test('settings: reset high score asks for confirmation (FR-12.2)', async ({ page }) => {
  await open(page);
  await page.evaluate(() => localStorage.setItem('flappyKiro.highScore', '12'));
  await page.reload();
  await expect(page.getByTestId('start-screen-high-score')).toHaveText('High score: 12');
  await page.getByTestId('start-screen-settings-button').click();
  await page.getByTestId('settings-menu-reset-button').click();
  await page.getByTestId('settings-menu-reset-cancel-button').click();
  await expect(stage(page)).toHaveAttribute('data-high-score', '12');
  await page.getByTestId('settings-menu-reset-button').click();
  await page.getByTestId('settings-menu-reset-confirm-button').click();
  await expect(stage(page)).toHaveAttribute('data-high-score', '0');
  await page.getByTestId('settings-menu-close-button').click();
  await expect(page.getByTestId('start-screen-high-score')).toHaveText('High score: 0');
  await page.reload();
  await expect(page.getByTestId('start-screen-high-score')).toHaveText('High score: 0');
});

test('settings menu works with the keyboard alone (FR-12.5)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('KeyS');
  await expect(page.getByTestId('settings-menu-sound-toggle')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('settings-menu-motion-toggle')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('settings-menu-motion-toggle')).toHaveText(/Motion: (Full|Reduced)/);
  await page.keyboard.press('Space'); // Space activates the menu button, it doesn't flap
  await expect(stage(page)).toHaveAttribute('data-state', 'SETTINGS');
  await page.keyboard.press('Escape');
  await expect(stage(page)).toHaveAttribute('data-state', 'START');
});

test('settings open from the pause screen and return to it (FR-12.1)', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyP');
  await page.getByTestId('pause-screen-settings-button').click();
  await expect(page.getByTestId('settings-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(stage(page)).toHaveAttribute('data-state', 'PAUSED');
});

test.describe('touch devices', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('a tap starts the game and the stage fits the screen (FR-2.1, FR-11.2)', async ({ page }) => {
    await open(page);
    await page.getByTestId('start-screen').tap({ position: { x: 10, y: 10 } });
    await expect(stage(page)).toHaveAttribute('data-state', 'PLAYING');
    const box = await stage(page).boundingBox();
    expect(box.width).toBeLessThanOrEqual(391);
    expect(Math.abs(box.width / box.height - 800 / 600)).toBeLessThan(0.01);
  });
});

test('the Content Security Policy is active and nothing violates it (SECURITY-04)', async ({ page }) => {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  const errors = await open(page);
  await page.keyboard.press('Space'); // sprite, sounds and styles all load during play
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  expect(errors).toEqual([]);
  // the policy really blocks things: an inline script is refused
  const inlineRan = await page.evaluate(() => {
    window.__inline = false;
    const s = document.createElement('script');
    s.textContent = 'window.__inline = true';
    document.body.appendChild(s);
    return window.__inline;
  });
  expect(inlineRan).toBe(false);
});
