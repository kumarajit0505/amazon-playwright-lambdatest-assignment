const { chromium } = require("playwright");
require("dotenv").config();

const LT_USERNAME = process.env.LT_USERNAME;
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY;
const IS_LAMBDATEST = process.env.LAMBDATEST === "true";

const connectToBrowser = async (capability) => {
  if (IS_LAMBDATEST) {
    console.log("[Setup] Connecting to LambdaTest cloud...");
    const browser = await chromium.connect({
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
        JSON.stringify(capability),
      )}&user=${LT_USERNAME}&accessKey=${LT_ACCESS_KEY}`,
    });
    return browser;
  } else {
    console.log("[Setup] Launching local Chromium browser...");
    const browser = await chromium.launch({
      headless: false, // headed by default locally so you can watch
    });
    return browser;
  }
};

module.exports = { connectToBrowser };
