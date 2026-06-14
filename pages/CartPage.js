const BasePage = require("./BasePage");

class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.subtotalAmount = page
      .locator(
        "#sc-subtotal-amount-activecart .a-size-medium.a-color-price, .sc-price.sc-white-space-nowrap",
      )
      .first();

    this.lineItemPrice = page
      .locator(
        '.sc-product-price.a-text-bold, [data-feature-id="sc-product-price"]',
      )
      .first();

    this.cartHeading = page.locator("#sc-active-cart");
    this.emptyCartMessage = page.locator(".sc-your-amazon-cart-is-empty");
  }

  async open() {
    await this.page.goto("/cart", { waitUntil: "domcontentloaded" });
    await this.page.waitForTimeout(2_000);
  }

  async getSubtotal() {
    return this.safeGetText(this.subtotalAmount);
  }

  async isEmpty() {
    return this.emptyCartMessage.isVisible({ timeout: 5_000 });
  }

  async getFirstItemDetails() {
    // Wait for cart items to fully render before reading
    await this.page.waitForSelector(
      '.sc-product-title, [data-feature-id="sc-product-title"] span, .sc-product-price, .sc-price',
      { state: "visible", timeout: 30_000 },
    );
    await this.page.waitForTimeout(2_000);

    const title = await this.safeGetText(
      this.page
        .locator('.sc-product-title, [data-feature-id="sc-product-title"] span')
        .first(),
    );

    const price = await this.safeGetText(
      this.page.locator(".sc-product-price, .sc-price").first(),
    );

    console.log(`[CartPage] Title: ${title.substring(0, 20)}`);
    console.log(`[CartPage] Price: ${price}`);

    return { title, price };
  }
}

module.exports = CartPage;
