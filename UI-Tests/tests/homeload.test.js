const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { describe, it, before, after } = require("mocha");

describe("Frontend-Resourcely UI Tests", function () {
  this.timeout(60000); // 60 seconds

  let driver;

  before(async function () {
    try {
      const options = new chrome.Options();
      if (process.env.HEADLESS !== "false") {
        options.addArguments("--headless=new", "--disable-gpu", "--window-size=1280,800");
      }

      const service = new chrome.ServiceBuilder(require("chromedriver").path);

      driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .setChromeService(service)
        .build();

      await driver.manage().setTimeouts({ pageLoad: 20000, implicit: 5000, script: 5000 });

      await driver.get("http://localhost:3000");

      await driver.wait(async () => {
        try {
          const ready = await driver.executeScript("return document.readyState");
          return ready === "complete" || ready === "interactive";
        } catch (_) {
          return false;
        }
      }, 10000);
    } catch (err) {
      console.error("Failed to initialize WebDriver or load page:", err);
      throw err;
    }
  });

  it("loads the homepage", async function () {
    const title = await driver.getTitle();
    console.log("Page title:", title);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });
});
