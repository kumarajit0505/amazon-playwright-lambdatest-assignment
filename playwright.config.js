// @ts-check
const { defineConfig, devices } = require("@playwright/test");
require("dotenv").config();

/**
 * Playwright Configuration
 *
 * Supports two execution modes:
 *   1. Local execution (default)     — npx playwright test
 *   2. LambdaTest cloud execution    — LAMBDATEST=true npx playwright test
 *
 * Parallel execution is enabled by default (workers: 2) so TC1 and TC2
 * run concurrently regardless of the execution target.
 */

const IS_LAMBDATEST = process.env.LAMBDATEST === "true";

// ---------------------------------------------------------------------------
// LambdaTest capability helpers
// ---------------------------------------------------------------------------
const LT_USERNAME = process.env.LT_USERNAME || "";
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY || "";
const LT_CDP_URL = `wss://cdp.lambdatest.com/playwright?user=${LT_USERNAME}&accessKey=${LT_ACCESS_KEY}`;

/**
 * Build LambdaTest capabilities for a given browser / OS combination.
 * @param {string} browserName
 * @param {string} browserVersion
 * @param {string} os
 * @returns {Record<string, unknown>}
 */
function ltCapabilities(browserName, browserVersion, os) {
  return {
    browserName,
    browserVersion,
    "LT:Options": {
      platform: os,
      build: "Amazon Cart Automation — Parallel Suite",
      name: `Amazon Cart — ${browserName}`,
      user: LT_USERNAME,
      accessKey: LT_ACCESS_KEY,
      network: true,
      video: true,
      console: true,
      tunnel: false,
    },
  };
}

// ---------------------------------------------------------------------------
// Project definitions
// ---------------------------------------------------------------------------

/** Local projects (two workers → true parallelism) */
const LOCAL_PROJECTS = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
];

/** LambdaTest cloud projects */
const LT_PROJECTS = [
  {
    name: "LT-Chrome-Windows",
    use: {
      connectOptions: { wsEndpoint: LT_CDP_URL },
      ...ltCapabilities("Chrome", "latest", "Windows 11"),
    },
  },
  // {
  //   name: "LT-Chrome-Mac",
  //   use: {
  //     connectOptions: { wsEndpoint: LT_CDP_URL },
  //     ...ltCapabilities("Chrome", "latest", "macOS Sonoma"),
  //   },
  // },
];

// ---------------------------------------------------------------------------
// Exported config
// ---------------------------------------------------------------------------
module.exports = defineConfig({
  testDir: "./tests",

  /* Maximum time one test can run (ms) */
  timeout: 90_000,

  /* Fail fast: stop after first failure in CI */
  maxFailures: process.env.CI ? 1 : 0,

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Parallel workers — 2 ensures TC1 and TC2 run simultaneously */
  workers: 2,

  /* Reporter: HTML for local, line for CI */
  reporter: process.env.CI
    ? [["line"], ["junit", { outputFile: "results/junit.xml" }]]
    : [
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["list"],
      ],

  /* Shared settings across ALL projects */
  use: {
    /* Base URL — keeps page objects clean */
    baseURL: "https://www.amazon.com",

    /* Capture screenshot only on failure */
    screenshot: "only-on-failure",

    /* Record video on first retry */
    video: "on-first-retry",

    /* Full-page trace on first retry */
    trace: "on-first-retry",

    /* Realistic viewport */
    viewport: { width: 1280, height: 800 },

    /* User-Agent: prevent bot-detection false positives */
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",

    /* Generous default action timeout */
    actionTimeout: 30_000,
  },

  /* One automatic retry on failure */
  retries: 1,

  /* Active project set depends on the execution target */
  projects: IS_LAMBDATEST ? LT_PROJECTS : LOCAL_PROJECTS,
});
