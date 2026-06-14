const BasePage = require("./BasePage");

class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);

    this.priceWhole = page.locator(".a-price-whole").first();
    this.priceFraction = page.locator(".a-price-fraction").first();
    this.priceSymbol = page.locator(".a-price-symbol").first();
    this.corePriceBlock = page
      .locator("#corePrice_desktop .a-offscreen")
      .first();

    this.addToCartBtn = page
      .locator(
        "#add-to-cart-button, " +
          '[data-feature-name="addToCart"] input[type="submit"], ' +
          "#submit.add-to-cart-button",
      )
      .first();

    this.productTitle = page.locator("#productTitle");

    this.addedToCartConfirmation = page
      .locator(
        "#attachDisplayAddBaseAlert, #sw-atc-confirmation, #NATC_SMART_WAGON_CONF_MSG_SUCCESS",
      )
      .first();

    this.cartCount = page.locator("#nav-cart-count");
  }

  async getPrice() {
    const accessiblePrice = await this.safeGetText(this.corePriceBlock, 5_000);
    if (accessiblePrice) return accessiblePrice;

    const symbol = await this.safeGetText(this.priceSymbol, 5_000);
    const whole = await this.safeGetText(this.priceWhole, 5_000);
    const fraction = await this.safeGetText(this.priceFraction, 5_000);

    const reconstructed = `${symbol}${whole}${fraction}`.replace(/\s+/g, "");
    if (reconstructed.match(/[\d,.]+/)) return reconstructed;

    const domPrice = await this.page.evaluate(() => {
      const el = document.querySelector(".a-price .a-offscreen");
      return el ? (el.textContent?.trim() ?? "") : "";
    });
    if (domPrice) return domPrice;

    return "Price unavailable";
  }

  async getProductTitle() {
    return this.safeGetText(this.productTitle);
  }

  async addToCart() {
    // Wait for Add to Cart button to be fully ready
    await this.addToCartBtn.waitFor({ state: "visible", timeout: 30_000 });
    await this.page.waitForTimeout(1_500);
    await this.addToCartBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1_000);
    await this.addToCartBtn.click();

    console.log("[ProductDetailPage] Clicked Add to Cart");

    // Wait for confirmation — allow extra time on cloud
    try {
      await Promise.race([
        this.addedToCartConfirmation.waitFor({
          state: "visible",
          timeout: 20_000,
        }),
        this.page.waitForURL(/cart|gp\/cart/, { timeout: 20_000 }),
      ]);
      await this.page.waitForTimeout(2_000);
      console.log("[ProductDetailPage] Add to Cart confirmed");
    } catch {
      console.warn(
        "[ProductDetailPage] Add-to-cart confirmation not detected — continuing.",
      );
    }
  }

  async getCartCount() {
    const text = await this.safeGetText(this.cartCount);
    const num = parseInt(text, 10);
    return Number.isNaN(num) ? 0 : num;
  }

  async isDeliverableToCurrentLocation() {
    const restrictionMsg = this.page
      .locator(
        ':has-text("beyond seller\'s shipping coverage"), ' +
          ':has-text("doesn\'t ship to"), ' +
          ':has-text("cannot be delivered"), ' +
          ':has-text("selected delivery location is beyond")',
      )
      .first();
    const hasRestriction = await restrictionMsg
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    return !hasRestriction;
  }

  async setDeliveryCountry(countryName = "Canada") {
    try {
      const deliverToLink = this.page
        .locator(
          'a:has-text("Deliver to"), #deliveryBlockSelectAAddressLink, ' +
            "#contextualIngressPtLabel_deliveryShortLine",
        )
        .first();

      await deliverToLink.waitFor({ state: "visible", timeout: 10_000 });
      await deliverToLink.click();
      console.log('[ProductDetailPage] Clicked "Deliver to" link');

      await this.page.waitForSelector("text=Choose your location", {
        state: "visible",
        timeout: 10_000,
      });
      await this.page.waitForTimeout(1_500);

      const countryDropdown = this.page
        .locator('select[name="GLUXCountryList"], #GLUXCountryList')
        .first();
      await countryDropdown.waitFor({ state: "visible", timeout: 8_000 });
      await countryDropdown.selectOption({ label: countryName });
      console.log(`[ProductDetailPage] Selected country: ${countryName}`);

      await this.page.waitForTimeout(1_500);

      const doneButton = this.page.locator('button:has-text("Done")').last();
      await doneButton.waitFor({ state: "visible", timeout: 8_000 });
      await doneButton.click({ force: true });
      console.log("[ProductDetailPage] Clicked Done button");

      await this.page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
      await page.reload();
      await this.page.waitForTimeout(3_000);
      console.log(
        `[ProductDetailPage] Delivery location updated to: ${countryName}`,
      );
    } catch (err) {
      console.warn(
        `[ProductDetailPage] setDeliveryCountry failed — ${err.message}`,
      );
    }
  }

  async clickCartIcon() {
    const cartIcon = this.page.locator("#nav-cart");
    await cartIcon.waitFor({ state: "visible", timeout: 10_000 });
    await cartIcon.click();
    await this.page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
    await this.page.waitForTimeout(2_000);
    console.log("[ProductDetailPage] Cart page opened");
  }
}

module.exports = ProductDetailPage;
