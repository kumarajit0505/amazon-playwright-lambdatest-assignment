const { test, expect } = require("@playwright/test");
const { connectToBrowser } = require("../utils/setup");
const { teardown } = require("../utils/teardown");
const capabilities = require("../config/capabilities");
const SearchResultsPage = require("../pages/SearchResultsPage");
const ProductDetailPage = require("../pages/ProductDetailPage");
const CartPage = require("../pages/CartPage");
const Logger = require("../utils/logger");
const TEST_DATA = require("../config/testData");

const logger = new Logger("TC1 — iPhone");
const { iphone } = TEST_DATA;

test.describe("TC1 — iPhone Shopping Cart", () => {
  test("Search for iPhone, add to cart, open cart, and print price", async () => {
    const browser = await connectToBrowser(capabilities[0]);
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set default navigation timeout for cloud environment
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(45_000);

    const searchPage = new SearchResultsPage(page);
    const productPage = new ProductDetailPage(page);
    const cartPage = new CartPage(page);

    try {
      // Step 1: Navigate to Amazon
      logger.info("Navigating to Amazon.com");
      await searchPage.goToHomePage();
      await searchPage.dismissCookieBanner();

      // Assert home page loaded
      expect(await page.title()).toContain("Amazon");
      logger.info("Amazon home page verified");

      // Step 2: Set delivery country
      logger.info(`Setting delivery country to ${iphone.deliveryCountry.name}`);
      await searchPage.setDeliveryCountry(iphone.deliveryCountry.name);

      // Step 3: Search for iPhone
      logger.info(`Searching for "${iphone.searchQuery}"`);
      await searchPage.searchFor(iphone.searchQuery);

      // Assert search results loaded
      expect(await page.title()).toContain(iphone.searchQuery);
      logger.info("Search results page verified");

      // Step 4: Click first organic result with price
      logger.info("Selecting first organic result with price");
      await searchPage.clickFirstOrganicResult(iphone.brandFilter);

      // Assert we landed on a product page
      expect(page.url()).toContain("/dp/");
      logger.info("Product detail page verified");

      // Step 5: Handle delivery restriction if shown
      const deliverable = await productPage.isDeliverableToCurrentLocation();
      if (!deliverable) {
        logger.warn(
          `Shipping restriction detected — setting country to ${iphone.deliveryCountry.name}`,
        );
        await productPage.setDeliveryCountry(iphone.deliveryCountry.name);
      }

      // Step 6: Add to cart
      logger.info("Adding product to cart");
      await productPage.addToCart();

      // Assert cart count increased
      const cartCount = await productPage.getCartCount();
      expect(cartCount).toBeGreaterThanOrEqual(1);
      logger.info(`Cart count verified: ${cartCount}`);

      // Step 7: Open cart
      logger.info("Opening cart");
      await productPage.clickCartIcon();

      // Assert cart page loaded
      expect(page.url()).toContain("/cart");
      logger.info("Cart page URL verified");

      // Step 8: Get and print title + price
      const { title, price } = await cartPage.getFirstItemDetails();

      // Assert title and price are not empty
      expect(title.length).toBeGreaterThan(0);
      expect(price).toMatch(/[$£€¥₹INR]|[\d,.]+/);

      logger.logPriceResult(title, price);

      // Mark passed on LambdaTest
      await page.evaluate(
        (_) => {},
        `lambdatest_action: ${JSON.stringify({ action: "setTestStatus", arguments: { status: "passed", remark: `iPhone cart test passed. Price: ${price}` } })}`,
      );
    } catch (err) {
      await page.evaluate(
        (_) => {},
        `lambdatest_action: ${JSON.stringify({ action: "setTestStatus", arguments: { status: "failed", remark: err.message } })}`,
      );
      throw err;
    } finally {
      await teardown(page, browser);
    }
  });
});
