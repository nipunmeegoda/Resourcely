const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { describe, it, before, after } = require("mocha");

describe("Admin Academic Scheduler (E2E)", function () {
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

  it("creates a booking by selecting a calendar slot and submitting the dialog", async function () {
    // Seed admin session in localStorage (origin must be loaded first)
    await driver.get(`${BASE_URL}`);
    await driver.executeScript(() => {
      const auth = { isAuthenticated: true, user: { role: "admin", email: "admin@example.com", username: "Admin" } };
      localStorage.setItem("auth", JSON.stringify(auth));
    });

    // Open Academic page
    await driver.get(`${BASE_URL}/admin/academic`);

    // Click the "Academic Scheduler" tab
    const schedulerTab = await driver.wait(
      until.elementLocated(By.xpath("//*[normalize-space(text())='Academic Scheduler' and (self::button or @role='tab' or self::* )]")),
      15000
    );
    await schedulerTab.click();

    // Wait for calendar to render
    await driver.wait(until.elementLocated(By.css(".rbc-calendar")), 15000);

    // Try month-view date cell first; if dialog doesn't appear, fallback to week view timeslot
    let dialogOpened = false;
    try {
      const anyDateCell = await driver.findElement(By.css(".rbc-month-view .rbc-date-cell"));
      await anyDateCell.click();
      await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'Create New Academic Booking')]")), 5000);
      dialogOpened = true;
    } catch (_) {}

    if (!dialogOpened) {
      // Switch to Week view via toolbar
      try {
        const weekBtn = await driver.findElement(By.xpath("//*[normalize-space(text())='Week' and (self::button or self::span or self::div)]"));
        await weekBtn.click();
      } catch (_) {}

      await driver.wait(until.elementLocated(By.css(".rbc-time-content")), 10000);
      const anyTimeSlot = await driver.findElement(By.css(".rbc-time-slot"));
      await anyTimeSlot.click();
      await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'Create New Academic Booking')]")), 10000);
    }

    // Fill Building → Floor → Block
    const selectFirstNonEmpty = async (selectCss) => {
      const selectEl = await driver.wait(until.elementLocated(By.css(selectCss)), 15000);
      const options = await selectEl.findElements(By.css("option"));
      for (const opt of options) {
        const val = await opt.getAttribute("value");
        if (val && val.trim() !== "") {
          await opt.click();
          return true;
        }
      }
      return false;
    };

    await selectFirstNonEmpty("#building-select");
    await driver.wait(until.elementLocated(By.css("#floor-select")), 10000);
    await selectFirstNonEmpty("#floor-select");
    await driver.wait(until.elementLocated(By.css("#block-select")), 10000);
    await selectFirstNonEmpty("#block-select");

    // Select first resource card (role=button)
    const resourceBtn = await driver.wait(
      until.elementLocated(By.xpath("//div[contains(@class,'cursor-pointer') and contains(@class,'border') and @role='button']")),
      10000
    );
    await resourceBtn.click();

    // Select lecturer using Radix Select: open trigger and click first option from portal
    const lecturerTrigger = await driver.wait(
      until.elementLocated(By.xpath("//label[normalize-space()='Lecturer']/following::*[(self::button or self::*[contains(@class,'SelectTrigger')])][1]")),
      10000
    );
    await driver.executeScript("arguments[0].scrollIntoView({block:'center', inline:'center'})", lecturerTrigger);
    await driver.wait(until.elementIsVisible(lecturerTrigger), 5000);
    await driver.wait(until.elementIsEnabled(lecturerTrigger), 5000);
    await driver.actions({ bridge: true }).move({ origin: lecturerTrigger }).click().perform();

    // Wait for the dropdown listbox rendered in a portal, then pick the first option
    const listbox = await driver.wait(
      until.elementLocated(By.xpath("//*[@role='listbox']")),
      10000
    );
    const firstOption = await driver.wait(
      until.elementLocated(By.xpath("(//*[@role='option'])[1]")),
      10000
    );
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", firstOption);
    await driver.actions({ bridge: true }).move({ origin: firstOption }).click().perform();

    // Reason and Capacity
    const reasonInput = await driver.findElement(By.id("reason"));
    await reasonInput.clear();
    await reasonInput.sendKeys("Automated Test Lecture");

    const capacityInput = await driver.findElement(By.id("capacity"));
    await capacityInput.clear();
    await capacityInput.sendKeys("25");

    // Submit
    const createBtn = await driver.findElement(By.xpath("//button[normalize-space(.)='Create Booking']"));
    await createBtn.click();

    // Assert success toast or dialog closed
    const success = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(., 'Booking created successfully!')]|//*[contains(@class,'toaster') or contains(@class,'toast')]")),
      10000
    ).catch(() => null);

    if (!success) {
      // Fallback: ensure dialog closed indicates success
      const dialogGone = await driver.findElements(By.xpath("//*[contains(., 'Create New Academic Booking')]"));
      if (dialogGone.length > 0) {
        throw new Error("Booking may not have been created - dialog still visible");
      }
    }
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });
});


