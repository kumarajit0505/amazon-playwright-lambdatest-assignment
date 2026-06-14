require("dotenv").config();

const LT_USERNAME = process.env.LT_USERNAME;
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY;

module.exports = [
  {
    browserName: "Chrome",
    browserVersion: "149.0",
    "LT:Options": {
      video: true,
      platform: "Windows 10",
      build: "Amazon Cart Automation — Parallel Suite",
      name: "Amazon Cart — TC1 iPhone",
      user: LT_USERNAME,
      accessKey: LT_ACCESS_KEY,
      tunnel: false,
      console: true,
    },
  },
  {
    browserName: "Chrome",
    browserVersion: "latest",
    "LT:Options": {
      video: true,
      platform: "Windows 10",
      build: "Amazon Cart Automation — Parallel Suite",
      name: "Amazon Cart — TC2 Galaxy",
      user: LT_USERNAME,
      accessKey: LT_ACCESS_KEY,
      tunnel: false,
      console: true,
    },
  },
];
