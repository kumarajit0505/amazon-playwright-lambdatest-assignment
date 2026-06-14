class BasePage {
  constructor(page) {
    this.page = page;
    // Default slow-mode wait between actions (ms) — helps on LambdaTest cloud
    this.STEP_DELAY = 2_000;
  }

  async goToHomePage() {
    await this.page.goto("https://www.amazon.com", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await this.page.waitForSelector(
      '#twotabsearchtextbox, input[name="field-keywords"]',
      { timeout: 45_000 },
    );
    // Allow page assets to settle on cloud infrastructure
    await this.page.waitForTimeout(this.STEP_DELAY);
  }

  async dismissCookieBanner() {
    try {
      const acceptBtn = this.page.locator(
        '#sp-cc-accept, [data-cel-widget="sp-cc"] button[data-action="sp-cc-accept"]',
      );
      if (await acceptBtn.isVisible({ timeout: 3_000 })) {
        await acceptBtn.click();
        await this.page.waitForTimeout(1_000);
      }
    } catch {
      // Banner not present — nothing to do
    }
  }

  async dismissSignInModal() {
    try {
      const modal = this.page.locator("#nav-flyout-ya-signin");
      if (await modal.isVisible({ timeout: 3_000 })) {
        await this.page.keyboard.press("Escape");
        await this.page.waitForTimeout(1_000);
      }
    } catch {
      // Modal not present — nothing to do
    }
  }

  async setDeliveryCountry(countryName = "Canada") {
    try {
      // Amazon has multiple variations of the "Deliver to" nav widget
      const deliverToBtn = this.page
        .locator(
          "#nav-global-location-popover-link, " +
            "#glow-ingress-block, " +
            "#glow-ingress-line2, " +
            '[data-nav-role="location"], ' +
            "span#glow-ingress-line1, " +
            "div#nav-global-location-slot",
        )
        .first();

      // Check if any variation is visible — if not, skip silently
      const isVisible = await deliverToBtn
        .isVisible({ timeout: 8_000 })
        .catch(() => false);

      if (!isVisible) {
        console.warn(
          '[BasePage] "Deliver to" nav widget not found — skipping nav-level country set. Will handle on PDP if needed.',
        );
        return;
      }

      await deliverToBtn.click();
      console.log('[BasePage] Clicked "Deliver to" nav widget');
      await this.page.waitForTimeout(2_000);

      // Wait for the "Choose your location" modal
      const modalVisible = await this.page
        .waitForSelector("text=Choose your location", {
          state: "visible",
          timeout: 10_000,
        })
        .catch(() => null);

      if (!modalVisible) {
        console.warn("[BasePage] Location modal did not open — skipping.");
        return;
      }

      // Select country from dropdown
      const countryDropdown = this.page
        .locator('select[name="GLUXCountryList"], #GLUXCountryList')
        .first();
      await countryDropdown.waitFor({ state: "visible", timeout: 8_000 });
      await countryDropdown.selectOption({ label: countryName });
      console.log(`[BasePage] Selected country: ${countryName}`);

      await this.page.waitForTimeout(1_500);

      // Click Done button
      const doneButton = this.page.locator('button:has-text("Done")').last();
      await doneButton.waitFor({ state: "visible", timeout: 8_000 });
      await doneButton.click({ force: true });

      await this.page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
      await this.page.waitForTimeout(3_000);
      console.log(`[BasePage] Delivery country set to: ${countryName}`);
    } catch (err) {
      console.warn(`[BasePage] setDeliveryCountry skipped — ${err.message}`);
    }
  }

  async safeGetText(locator, timeout = 10_000) {
    try {
      return (await locator.textContent({ timeout }))?.trim() ?? "";
    } catch {
      return "";
    }
  }
}

module.exports = BasePage;
