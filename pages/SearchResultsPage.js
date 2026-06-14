const BasePage = require("./BasePage");

class SearchResultsPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page
      .locator('#twotabsearchtextbox, input[name="field-keywords"]')
      .first();
    this.searchButton = page
      .locator('#nav-search-submit-button, input[value="Go"]')
      .first();
    this.resultCards = page.locator('[data-component-type="s-search-result"]');
  }

  async searchFor(query) {
    // Wait for search input to be ready before typing
    await this.searchInput.waitFor({ state: "visible", timeout: 15_000 });
    await this.searchInput.click();
    await this.page.waitForTimeout(500);
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);

    await this.searchButton.click();

    // Wait for results to load
    await this.resultCards
      .first()
      .waitFor({ state: "visible", timeout: 45_000 });

    // Allow all result cards to render fully on cloud
    await this.page.waitForTimeout(3_000);
    console.log(`[SearchResultsPage] Results loaded for: "${query}"`);
  }

  async clickFirstOrganicResult(brandFilter = null) {
    const LINK_SELECTORS = [
      "h2 a.a-link-normal",
      "h2 a",
      "a.a-link-normal.s-no-outline",
      'a[href*="/dp/"]',
    ];

    // Wait for all cards to be present in DOM
    await this.page.waitForSelector('[data-component-type="s-search-result"]', {
      timeout: 30_000,
    });
    await this.page.waitForTimeout(2_000);

    const cards = await this.resultCards.all();
    console.log(`[SearchResultsPage] Total cards found: ${cards.length}`);

    for (const card of cards) {
      // Skip sponsored cards
      const isSponsored = await card
        .locator(
          '.s-sponsored-label-info-icon, [aria-label*="Sponsored"], .puis-sponsored-label-text',
        )
        .isVisible()
        .catch(() => false);
      if (isSponsored) continue;

      // ── Brand filter — skip card if title doesn't match required brand ──
      if (brandFilter) {
        const cardTitle = await this.safeGetText(
          card.locator("h2 span, h2 a span").first(),
        );
        const matchesBrand = cardTitle
          .toLowerCase()
          .includes(brandFilter.toLowerCase());
        if (!matchesBrand) {
          console.warn(
            `[SearchResultsPage] Skipping card — title "${cardTitle.substring(0, 60)}" does not match brand filter "${brandFilter}"`,
          );
          continue;
        }
      }

      // Skip cards with no visible price
      const priceEl = card
        .locator(
          '.a-price .a-offscreen, .a-price-whole, span[data-a-color="price"] .a-offscreen',
        )
        .first();
      const hasPrice = await priceEl.isVisible().catch(() => false);
      if (!hasPrice) {
        console.warn("[SearchResultsPage] Skipping card — no price found.");
        continue;
      }

      // Skip non-deliverable cards
      const notDeliverable = await card
        .locator(
          ':has-text("doesn\'t ship"), :has-text("not available"), :has-text("cannot be delivered")',
        )
        .isVisible()
        .catch(() => false);
      if (notDeliverable) {
        console.warn("[SearchResultsPage] Skipping card — not deliverable.");
        continue;
      }

      // Try each link selector until one works
      for (const selector of LINK_SELECTORS) {
        const link = card.locator(selector).first();
        const visible = await link.isVisible().catch(() => false);
        if (!visible) continue;

        const href = await link.getAttribute("href").catch(() => null);

        try {
          await card.scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(500);
          await link.click({ timeout: 15_000 });
          await this.page.waitForLoadState("domcontentloaded", {
            timeout: 45_000,
          });
          await this.page.waitForTimeout(3_000);
          return;
        } catch {
          if (href) {
            const url = href.startsWith("http")
              ? href
              : `https://www.amazon.com${href}`;
            console.warn(
              `[SearchResultsPage] click() failed — navigating to ${url}`,
            );
            await this.page.goto(url, {
              waitUntil: "domcontentloaded",
              timeout: 60_000,
            });
            await this.page.waitForTimeout(3_000);
            return;
          }
        }
      }
    }

    throw new Error(
      `[SearchResultsPage] No card found matching brand "${brandFilter}" with a visible price.`,
    );
  }
}

module.exports = SearchResultsPage;
