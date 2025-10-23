const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { describe, it, before, after } = require("mocha");

describe("Admin Manage Batch - Create Batch", function () {
  this.timeout(90000);

  let driver;
  const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

  before(async function () {
    const options = new chrome.Options();
    if (process.env.HEADLESS !== "false") {
      options.addArguments("--headless=new", "--disable-gpu", "--window-size=1400,900");
    }
    const service = new chrome.ServiceBuilder(require("chromedriver").path);

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    await driver.manage().setTimeouts({ pageLoad: 30000, implicit: 5000, script: 7000 });
  });

  it("creates a new batch via dialog", async function () {
    // Seed admin session
    await driver.get(`${BASE_URL}`);
    await driver.executeScript(() => {
      const auth = { isAuthenticated: true, user: { role: "admin", email: "admin@example.com", username: "Admin" } };
      localStorage.setItem("auth", JSON.stringify(auth));
    });

    // Open Admin Academic page and ensure Manage Batch tab
    await driver.get(`${BASE_URL}/admin/academic`);
    try {
      const manageTab = await driver.wait(
        until.elementLocated(By.xpath("//*[normalize-space(.)='Manage Batch Groups' and (self::button or @role='tab' or self::* )]")),
        15000
      );
      await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", manageTab);
      await driver.wait(until.elementIsVisible(manageTab), 10000);
      await driver.wait(until.elementIsEnabled(manageTab), 10000);
      await manageTab.click();
    } catch (_) {}

    // Click "Create New Batch" button
    const createBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[normalize-space(.)='Create New Batch' or normalize-space(.)='Create Batch']")
      ),
      15000
    );
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", createBtn);
    await driver.wait(until.elementIsVisible(createBtn), 10000);
    await driver.wait(until.elementIsEnabled(createBtn), 10000);
    await createBtn.click();

    // Wait for dialog
    await driver.wait(
      until.elementLocated(By.xpath("//div[@role='dialog']//*[normalize-space(.)='Create New Batch']")),
      10000
    );

    // Fill fields
    const nameInput = await driver.findElement(By.id("name"));
    const codeInput = await driver.findElement(By.id("code"));
    await driver.wait(until.elementIsVisible(nameInput), 10000);
    await driver.wait(until.elementIsEnabled(nameInput), 10000);
    await driver.wait(until.elementIsVisible(codeInput), 10000);
    await driver.wait(until.elementIsEnabled(codeInput), 10000);

    await nameInput.clear();
    await codeInput.clear();

    // Generate faculty name + last 2 digits of year
    const faculty = "SE"; // Example: SE, IT, QA, etc.
    const year = new Date().getFullYear().toString().slice(-2); // "26"
    const batchName = `${new Date().getFullYear()} – ${faculty}`; // 2026 – SE
    const batchCode = `${faculty}${year}`; // SE26

    await nameInput.sendKeys(batchName);
    await codeInput.sendKeys(batchCode);

    // Submit
    const submitBtn = await driver.findElement(
      By.xpath("//div[@role='dialog']//button[normalize-space(.)='Create' or normalize-space(.)='Creating...']")
    );
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", submitBtn);
    await driver.wait(until.elementIsVisible(submitBtn), 10000);
    await driver.wait(until.elementIsEnabled(submitBtn), 10000);
    await submitBtn.click();

    // Wait for dialog to close
    await driver.wait(async () => {
      const els = await driver.findElements(By.xpath("//div[@role='dialog']//*[normalize-space(.)='Create New Batch']"));
      return els.length === 0;
    }, 20000);

    // Refresh and assert batch exists
    try {
      const refresh = await driver.findElement(By.xpath("//button[normalize-space(.)='Refresh']"));
      await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", refresh);
      await driver.wait(until.elementIsVisible(refresh), 10000);
      await driver.wait(until.elementIsEnabled(refresh), 10000);
      await refresh.click();
    } catch (_) {}

    await driver.wait(
      until.elementLocated(By.xpath(`//tbody/tr[td[contains(normalize-space(.), '${batchCode}')]]`)),
      20000
    );
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });
});
