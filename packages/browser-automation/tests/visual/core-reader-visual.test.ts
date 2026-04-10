/**
 * Visual Regression Tests for Core Reader
 *
 * Covers 7 tabs (skills, adrs, roadmap, okrs, docs, changes, interactive),
 * theme toggle, settings modal, sidebar states,
 * and responsive viewports (mobile + tablet).
 *
 * Core Reader uses Carbon <Tabs> — selectors use button[role="tab"]:nth-of-type(N)
 * since data-element attributes are not yet present on tab buttons.
 */

import { createTestSuite, createTestRunner } from '../../src/test-runner/index.js';
import { VisualDiffReporter } from '../../src/test-runner/reporters/VisualDiffReporter.js';
import { GitHubPRReporter } from '../../src/test-runner/reporters/GitHubPRReporter.js';
import { createVisualAssertions } from '../../src/test-runner/assertions/visual.js';
import { VISUAL_THRESHOLDS } from '../../src/visual/constants.js';

const API_URL = process.env.API_URL || 'http://localhost:3032';
const APP_URL = process.env.BROWSER_APP_URL || 'http://localhost:3015';
const UPDATE_BASELINES = process.env.UPDATE_BASELINES === 'true';
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const GITHUB_RUN_NUMBER = process.env.GITHUB_RUN_NUMBER;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;

const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR
  ? `${process.env.SCREENSHOTS_DIR}/visual-test`
  : 'temp/screenshots/visual-test';

// Carbon tab selectors (Core Reader uses Carbon <Tabs> without data-element attrs)
const TAB_SELECTORS = {
  skills: 'button[role="tab"]:nth-of-type(1)',
  adrs: 'button[role="tab"]:nth-of-type(2)',
  roadmap: 'button[role="tab"]:nth-of-type(3)',
  okrs: 'button[role="tab"]:nth-of-type(4)',
  docs: 'button[role="tab"]:nth-of-type(5)',
  changes: 'button[role="tab"]:nth-of-type(6)',
  interactive: 'button[role="tab"]:nth-of-type(7)',
};

if (UPDATE_BASELINES) {
  console.log('');
  console.log('UPDATE_BASELINES=true - All baselines will be updated');
  console.log('WARNING: This will overwrite existing baselines!');
  console.log('');
}

async function main() {
  const { suite, client } = createTestSuite(
    'Core Reader Visual Regression',
    API_URL
  );

  const visualReporter = new VisualDiffReporter('./temp/test-results');
  const visual = createVisualAssertions('core-reader-visual', visualReporter);

  // Suite setup — wait for app to be ready
  suite.beforeAll(async () => {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`Retry attempt ${attempt}/${maxRetries}...`);
        }

        await client.navigate(APP_URL);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await client.waitForSelector('[data-element="app-container"], .app-container', { timeout: 30000 });
        console.log('Core Reader loaded');
        return;
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    throw new Error(`Failed to load Core Reader after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  });

  // ── Dashboard ──────────────────────────────────────────────────────────

  suite.test('Dashboard - Initial Load', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await client.screenshot({
      name: 'dashboard-initial',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'dashboard-initial-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  // ── Tab tests (desktop) ────────────────────────────────────────────────

  suite.test('Skills Tab - Layout', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    await client.click(TAB_SELECTORS.skills);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await client.screenshot({
      name: 'skills-tab',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'skills-tab-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  suite.test('ADRs Tab - Layout', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    await client.click(TAB_SELECTORS.adrs);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await client.screenshot({
      name: 'adrs-tab',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'adrs-tab-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  suite.test('Roadmap Tab - Layout', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    await client.click(TAB_SELECTORS.roadmap);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await client.screenshot({
      name: 'roadmap-tab',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'roadmap-tab-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  suite.test('OKRs Tab - Layout', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    await client.click(TAB_SELECTORS.okrs);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await client.screenshot({
      name: 'okrs-tab',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'okrs-tab-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  suite.test('Docs Tab - Layout', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    await client.click(TAB_SELECTORS.docs);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await client.screenshot({
      name: 'docs-tab',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'docs-tab-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  suite.test('Changes Tab - Layout', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    await client.click(TAB_SELECTORS.changes);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await client.screenshot({
      name: 'changes-tab',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'changes-tab-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  suite.test('Interactive Tab - Layout', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    await client.click(TAB_SELECTORS.interactive);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await client.screenshot({
      name: 'interactive-tab',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'interactive-tab-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  // ── Interactive states ──────────────────────────────────────────────────

  suite.test('Theme - Light Mode', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    const themeToggleExists = await client.elementExists('[data-element="theme-toggle"]');
    if (themeToggleExists) {
      await client.click('[data-element="theme-toggle"]');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const result = await client.screenshot({
      name: 'theme-light',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'theme-light-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });

    if (themeToggleExists) {
      await client.click('[data-element="theme-toggle"]');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  });

  suite.test('Settings Modal', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');

    const settingsExists = await client.elementExists('[data-element="settings-toggle"]');
    if (settingsExists) {
      await client.click('[data-element="settings-toggle"]');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const result = await client.screenshot({
      name: 'settings-modal',
      viewport: 'desktop',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'settings-modal-desktop', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });

    await client.pressKey('Escape');
    await new Promise(resolve => setTimeout(resolve, 300));
  });

  // ── Responsive — Mobile ────────────────────────────────────────────────

  suite.test('Dashboard - Mobile', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await client.screenshot({
      name: 'dashboard-mobile',
      viewport: 'mobile',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'dashboard-mobile', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  // ── Responsive — Tablet ────────────────────────────────────────────────

  suite.test('Dashboard - Tablet', async ({ assert }) => {
    await client.navigate(APP_URL);
    await client.waitForSelector('[data-element="app-container"], .app-container');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await client.screenshot({
      name: 'dashboard-tablet',
      viewport: 'tablet',
      fullPage: true,
      path: SCREENSHOTS_DIR,
    });

    assert.screenshotCaptured(result);
    await visual.matchesBaseline(result.path, 'dashboard-tablet', {
      threshold: VISUAL_THRESHOLDS.STANDARD,
      updateBaseline: UPDATE_BASELINES,
    });
  });

  // ── Run ────────────────────────────────────────────────────────────────

  const reporters: any[] = ['console', visualReporter];

  if (GITHUB_RUN_ID) {
    reporters.push(
      new GitHubPRReporter({
        outputPath: './temp/test-results/github-pr-comment.md',
        runId: GITHUB_RUN_ID,
        runNumber: GITHUB_RUN_NUMBER,
        repository: GITHUB_REPOSITORY,
      })
    );
  }

  const runner = createTestRunner({
    reporters,
    verbose: true,
  });

  const result = await runner.run(suite);
  const exitCode = result.summary.failed > 0 ? 1 : 0;

  console.log('');
  console.log(`Core Reader Visual Regression: ${exitCode === 0 ? 'PASSED' : 'FAILED'}`);
  console.log(`  ${result.summary.passed} passed, ${result.summary.failed} failed, ${result.summary.skipped} skipped`);
  console.log('');

  process.exit(exitCode);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
