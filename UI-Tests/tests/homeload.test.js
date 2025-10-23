const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Frontend-Resourcely UI Tests", function () {
  this.timeout(30000); // 30 seconds max per test
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  it("loads the homepage", async () => {
    await driver.get("http://localhost:3000"); // Change if your frontend runs on another port
    const title = await driver.getTitle();
    console.log("Page title:", title);
    assert.ok(title);
  });
});
