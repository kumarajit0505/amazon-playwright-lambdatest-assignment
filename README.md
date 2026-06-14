# Amazon Cart Automation — Playwright Test Suite

![Playwright](https://img.shields.io/badge/Playwright-1.44.0-2EAD33?style=flat&logo=playwright)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat&logo=javascript)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=nodedotjs)
![LambdaTest](https://img.shields.io/badge/LambdaTest-Cloud-blueviolet?style=flat)

---

## Table of Contents

- [Overview](#overview)
- [Test Scenarios](#test-scenarios)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Running Tests Locally](#running-tests-locally)
- [Running Tests on LambdaTest](#running-tests-on-lambdatest)
- [Page Objects](#page-objects)
- [Test Data Management](#test-data-management)
- [Parallel Execution](#parallel-execution)
- [Reporting](#reporting)
- [Best Practices Applied](#best-practices-applied)

---

## Overview

This project is a **production-grade test automation suite** built with [Playwright](https://playwright.dev/) and JavaScript. It automates end-to-end shopping cart workflows on [Amazon.com](https://www.amazon.com), demonstrating:

- Page Object Model (POM) design pattern
- Parallel test execution
- Cloud-based testing via LambdaTest
- Robust element interaction with multi-selector fallback strategies
- Structured logging with timestamped console output
- Brand filtering to ensure correct product selection
- Dynamic delivery country selection

---

## Test Scenarios

| ID  | Scenario                                                                                                               | Browser | Verification                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------- |
| TC1 | Navigate → Search **iPhone 15 Pro** → Filter Apple-only results → Add to Cart → Open Cart → Print title & price        | Chrome  | Cart count ≥ 1, price non-empty, URL contains `/cart` |
| TC2 | Navigate → Search **Samsung Galaxy S24** → Filter Samsung-only results → Add to Cart → Open Cart → Print title & price | Chrome  | Cart count ≥ 1, price non-empty, URL contains `/cart` |

Both tests run **in parallel** using 2 workers, each in an isolated browser session.

---

## Project Structure

```
amazon-playwright-tests/
│
├── config/
│   ├── capabilities.js       # LambdaTest browser capabilities
│   └── testData.js           # Centralised test data (search terms, brand filters, delivery country)
│
├── pages/
│   ├── BasePage.js           # Abstract base class — shared navigation, waits, delivery country helper
│   ├── SearchResultsPage.js  # Search bar interactions, organic result selection with brand filter
│   ├── ProductDetailPage.js  # Price extraction, Add-to-Cart flow, PDP delivery restriction handler
│   └── CartPage.js           # Cart item title & price retrieval
│
├── tests/
│   ├── tc1-iphone-cart.spec.js    # Test Case 1 — iPhone
│   └── tc2-galaxy-cart.spec.js    # Test Case 2 — Samsung Galaxy
│
├── utils/
│   ├── logger.js             # Structured colour-coded console logger
│   ├── setup.js              # LambdaTest browser connection helper
│   └── teardown.js           # Browser/page cleanup
│
├── .env                      # Local environment variables (DO NOT COMMIT)
├── .env.example              # Template for environment variables
├── .gitignore
├── package.json
├── playwright.config.js      # Playwright config — parallel execution, LambdaTest projects
└── README.md
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Test Files                      │
│         tc1-iphone-cart.spec.js                  │
│         tc2-galaxy-cart.spec.js                  │
└──────────────────┬──────────────────────────────┘
                   │ uses
┌──────────────────▼──────────────────────────────┐
│               Page Objects                       │
│  BasePage → SearchResultsPage                    │
│          → ProductDetailPage                     │
│          → CartPage                              │
└──────────────────┬──────────────────────────────┘
                   │ reads
┌──────────────────▼──────────────────────────────┐
│            Config & Utils                        │
│  testData.js  │  capabilities.js                │
│  logger.js    │  setup.js  │  teardown.js        │
└──────────────────┬──────────────────────────────┘
                   │ executes on
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐       ┌────────▼────────┐
│   Local     │       │   LambdaTest    │
│  Chromium   │       │  Cloud Grid     │
└─────────────┘       └─────────────────┘
```

---

## Prerequisites

| Tool               | Minimum Version | Download               |
| ------------------ | --------------- | ---------------------- |
| Node.js            | 18.x LTS        | https://nodejs.org     |
| npm                | 9.x             | Bundled with Node.js   |
| Git                | 2.x             | https://git-scm.com    |
| LambdaTest Account | —               | https://lambdatest.com |

---

## Local Setup

### 1 — Clone the repository

```bash
git clone https://github.com/<your-username>/amazon-playwright-tests.git
cd amazon-playwright-tests
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Install Playwright browsers

```bash
npx playwright install --with-deps chromium
```

### 4 — Set up environment variables

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

Open `.env` and fill in your LambdaTest credentials (see [Environment Variables](#environment-variables)).

---

## Environment Variables

Create a `.env` file in the project root. Use `.env.example` as a template:

```env
# ── LambdaTest Credentials ───────────────────────────────────────────
# Obtain from: https://accounts.lambdatest.com/detail/profile
LT_USERNAME=your_lambdatest_username
LT_ACCESS_KEY=your_lambdatest_access_key

# ── Execution Target ─────────────────────────────────────────────────
# Set to "true" to run on LambdaTest cloud
# Leave as "false" to run locally
LAMBDATEST=false
```

### How to get LambdaTest credentials

1. Log in to [lambdatest.com](https://lambdatest.com)
2. Click your **profile icon** → **Profile & Settings**
3. Copy **Username** and **Access Key**

---

## Running Tests Locally

All commands are run from the project root directory.

### Run all tests in parallel (recommended)

```bash
npx playwright test --workers=2
```

### Run in headed mode (watch the browser)

```bash
npx playwright test --headed --workers=2
```

### Run a single test file

```bash
# TC1 — iPhone only
npx playwright test tests/tc1-iphone-cart.spec.js --headed

# TC2 — Galaxy only
npx playwright test tests/tc2-galaxy-cart.spec.js --headed
```

### Run sequentially (one at a time)

```bash
npx playwright test --workers=1
```

### View HTML report after run

```bash
npx playwright show-report
```

---

## Running Tests on LambdaTest

### Step 1 — Configure credentials

Ensure your `.env` file has valid `LT_USERNAME` and `LT_ACCESS_KEY`.

### Step 2 — Set LAMBDATEST flag

**Windows PowerShell:**

```powershell
$env:LAMBDATEST="true"
$env:LT_USERNAME="your_username"
$env:LT_ACCESS_KEY="your_access_key"
npx playwright test
```

**Mac / Linux:**

```bash
LAMBDATEST=true npx playwright test
```

### Step 3 — View results on LambdaTest Dashboard

1. Go to [automation.lambdatest.com](https://automation.lambdatest.com)
2. Click **Web Automation** in the left sidebar
3. Find build: **"Amazon Cart Automation — Parallel Suite"**
4. Click any session to view:
   - 🎥 Video recording
   - 🌐 Network logs
   - 🖥️ Console logs
   - 📸 Screenshots on failure
   - 📋 Step-by-step command log

### LambdaTest Capabilities

Configured in `config/capabilities.js`:

| Capability   | TC1 (iPhone)  | TC2 (Galaxy)  |
| ------------ | ------------- | ------------- |
| Browser      | Chrome latest | Chrome latest |
| Platform     | Windows 10    | Windows 10    |
| Video        | ✅            | ✅            |
| Console logs | ✅            | ✅            |
| Tunnel       | false         | false         |

> **Note:** `tunnel: false` is correct for Amazon since it is a publicly accessible site. Tunnel is only required for localhost or internal applications.

---

## Page Objects

### BasePage

Base class inherited by all page objects.

### SearchResultsPage

### ProductDetailPage

### CartPage

---

## Test Data Management

All test data is centralised in `config/testData.js`:

To change search terms, delivery country, or brand filters — edit only this file. No test files need to change.

---

## Parallel Execution

Tests are designed to run concurrently:

```
Worker 1                          Worker 2
────────────────────              ────────────────────
TC1 — iPhone (Chrome)             TC2 — Galaxy (Chrome)
  ↓ Navigate Amazon                 ↓ Navigate Amazon
  ↓ Search iPhone                   ↓ Search Galaxy
  ↓ Filter Apple cards              ↓ Filter Samsung cards
  ↓ Add to Cart                     ↓ Add to Cart
  ↓ Open Cart                       ↓ Open Cart
  ↓ Print price                     ↓ Print price
```

Each worker gets its own **isolated browser session** — cart state never bleeds between TC1 and TC2.

---

## Reporting

### Console Output

Each log line is timestamped and colour-coded:

```
[INFO]    2026-06-14T13:33:10.000Z [TC1 — iPhone]  Navigating to Amazon.com
[INFO]    2026-06-14T13:33:15.000Z [TC1 — iPhone]  Search results page verified
[WARNING] 2026-06-14T13:33:20.000Z [TC1 — iPhone]  Shipping restriction detected
[INFO]    2026-06-14T13:33:25.000Z [TC1 — iPhone]  Adding product to cart

  PRICE RETRIEVED
──────────────────────────────────────────────────
  Context : TC1 — iPhone
  Product : Apple iPhone 15 Pro
  Price   : INR XX,XXX.XX
──────────────────────────────────────────────────
```

### HTML Report

Generated automatically after each run:

```bash
npx playwright show-report
```

Opens an interactive HTML report at `playwright-report/index.html` showing:

- Pass/fail status per test
- Step-by-step execution timeline
- Screenshots on failure
- Video recordings (on retry)
- Full error traces

---

## Best Practices Applied

| Practice                    | Implementation                                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page Object Model**       | All selectors and interactions encapsulated in page classes; zero raw locators in test files                                                    |
| **Single Responsibility**   | Each page object handles exactly one page domain                                                                                                |
| **Centralised Test Data**   | All search terms, brands, and country data in `testData.js`                                                                                     |
| **Multi-selector fallback** | 4–7 selector variants tried in order for resilience against DOM changes                                                                         |
| **Brand filtering**         | Prevents wrong product selection when mixed results appear                                                                                      |
| **Graceful degradation**    | Every interaction wrapped in try/catch; warnings logged instead of hard failures where appropriate                                              |
| **Cloud isolation**         | Each test uses its own named LambdaTest capability for independent session tracking                                                             |
| **Structured logging**      | Timestamped, colour-coded, context-prefixed output for parallel run readability                                                                 |
| **Explicit waits**          | `waitFor`, `waitForSelector`, `waitForLoadState` used throughout; no `sleep` anti-patterns except where Amazon's UI genuinely needs settle time |
| **Assertions at each step** | Page title, URL, cart count, price format all verified independently                                                                            |
| **Environment separation**  | Local vs cloud execution toggled via `LAMBDATEST` env var; no code changes needed to switch                                                     |

---

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.44.0"
  },
  "dependencies": {
    "dotenv": "^16.4.5"
  }
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---
