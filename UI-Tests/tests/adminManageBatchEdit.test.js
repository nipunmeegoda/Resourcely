const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { describe, it, before, after } = require("mocha");

describe("Admin Manage Batch - Edit Batch", function () {
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

  it("edits batch '2025 – CS' to '2025 – IT' with code 'IT25'", async function () {
    // Seed admin session in localStorage
    await driver.get(`${BASE_URL}`);
    await driver.executeScript(() => {
      const auth = { isAuthenticated: true, user: { role: "admin", email: "admin@example.com", username: "Admin" } };
      localStorage.setItem("auth", JSON.stringify(auth));
    });

    // Open Admin Academic page (Manage Batch Groups tab is default)
    await driver.get(`${BASE_URL}/admin/academic`);

    // Wait for the table to load
    await driver.wait(until.elementLocated(By.xpath("//table//thead//tr//th[normalize-space(.)='Batch Name']")), 20000);

    // Locate the row containing the current batch name (robust match for '2025' and 'CS')
    const targetRow = await driver.wait(
      until.elementLocated(
        By.xpath("//tbody/tr[.//td[contains(normalize-space(.), '2025') and contains(normalize-space(.), 'CS')]]")
      ),
      20000
    );

    // Click Edit in that row
    const editBtn = await targetRow.findElement(By.xpath(".//button[contains(normalize-space(.), 'Edit')]"));
    await editBtn.click();

    // Wait for Edit dialog
    await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//*[normalize-space(.)='Edit Batch']")), 10000);

    // Fill new values
    const nameInput = await driver.findElement(By.id("bname"));
    await nameInput.clear();
    await nameInput.sendKeys("2025 – IT");

    const codeInput = await driver.findElement(By.id("bcode"));
    await codeInput.clear();
    await codeInput.sendKeys("IT25");

    // Save changes
    const saveBtn = await driver.findElement(By.xpath("//div[@role='dialog']//button[normalize-space(.)='Save changes']"));
    await saveBtn.click();

    // Wait for dialog to close (Edit Batch title disappears)
    await driver.wait(async () => {
      const els = await driver.findElements(By.xpath("//div[@role='dialog']//*[normalize-space(.)='Edit Batch']"));
      return els.length === 0;
    }, 10000);

    // Assert the row now shows the updated name and code
    await driver.wait(
      until.elementLocated(
        By.xpath("//tbody/tr[.//td[normalize-space(.)='2025 – IT'] and .//td[normalize-space(.)='IT25']]")
      ),
      20000
    );
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });
});


