// const { Builder, By, until } = require("selenium-webdriver");
// const chrome = require("selenium-webdriver/chrome");
// const { describe, it, before, after } = require("mocha");

// describe("Admin Manage Batch - Edit Batch", function () {
//   this.timeout(90000);

//   let driver;
//   const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

//   before(async function () {
//     const options = new chrome.Options();
//     if (process.env.HEADLESS !== "false") {
//       options.addArguments("--headless=new", "--disable-gpu", "--window-size=1400,900");
//     }
//     const service = new chrome.ServiceBuilder(require("chromedriver").path);

//     driver = await new Builder()
//       .forBrowser("chrome")
//       .setChromeOptions(options)
//       .setChromeService(service)
//       .build();

//     await driver.manage().setTimeouts({ pageLoad: 30000, implicit: 5000, script: 7000 });
//   });

//   it("edits batch '2025 – CS' to '2025 – IT' with code 'IT25'", async function () {
//     // Seed admin session in localStorage
//     await driver.get(`${BASE_URL}`);
//     await driver.executeScript(() => {
//       const auth = { isAuthenticated: true, user: { role: "admin", email: "admin@example.com", username: "Admin" } };
//       localStorage.setItem("auth", JSON.stringify(auth));
//     });

//     // Open Admin Academic page (click Manage Batch Groups explicitly)
//     await driver.get(`${BASE_URL}/admin/academic`);

//     try {
//       const manageTab = await driver.wait(
//         until.elementLocated(
//           By.xpath("//*[normalize-space(.)='Manage Batch Groups' and (self::button or @role='tab' or self::* )]")
//         ),
//         15000
//       );
//       await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", manageTab);
//       await driver.wait(until.elementIsVisible(manageTab), 10000);
//       await driver.wait(until.elementIsEnabled(manageTab), 10000);
//       await manageTab.click();
//     } catch (_) {
//       // If tab not found, assume it's already active
//     }

//     // Wait for the table to load
//     await driver.wait(until.elementLocated(By.xpath("//table//thead//tr//th[normalize-space(.)='Batch Name']")), 20000);

//     // Locate the row by current or desired code in the 2nd column (more stable & idempotent)
//     const targetRow = await driver.wait(
//       until.elementLocated(
//         By.xpath("//tbody/tr[td[2][normalize-space(.)='CS25' or normalize-space(.)='IT25']]")
//       ),
//       20000
//     );
//     await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", targetRow);
//     await driver.wait(until.elementIsVisible(targetRow), 10000);

//     // Click Edit in that row
//     const editBtn = await targetRow.findElement(By.xpath(".//button[contains(normalize-space(.), 'Edit')]"));
//     await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", editBtn);
//     await driver.wait(until.elementIsVisible(editBtn), 5000);
//     await driver.wait(until.elementIsEnabled(editBtn), 5000);
//     await editBtn.click();

//     // Wait for Edit dialog
//     await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//*[normalize-space(.)='Edit Batch']")), 10000);

//     // Fill new values
//     const nameInput = await driver.findElement(By.id("bname"));
//     await driver.wait(until.elementIsVisible(nameInput), 10000);
//     await driver.wait(until.elementIsEnabled(nameInput), 10000);
//     await nameInput.clear();
//     await nameInput.sendKeys("2025 – IT");

//     const codeInput = await driver.findElement(By.id("bcode"));
//     await driver.wait(until.elementIsVisible(codeInput), 10000);
//     await driver.wait(until.elementIsEnabled(codeInput), 10000);
//     await codeInput.clear();
//     await codeInput.sendKeys("IT25");

//     // Save changes
//     const saveBtn = await driver.findElement(By.xpath("//div[@role='dialog']//button[normalize-space(.)='Save changes']"));
//     await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", saveBtn);
//     await driver.wait(until.elementIsVisible(saveBtn), 5000);
//     await driver.wait(until.elementIsEnabled(saveBtn), 5000);
//     await saveBtn.click();

//     // Wait for either success or error toast
//     const successXPath = "//*[contains(., 'Batch updated')]";
//     const errorXPath = "//*[contains(., 'Failed to update batch') or contains(., 'Error') or contains(., 'already exists') or contains(., 'BadRequest')]";

//     const winner = await Promise.race([
//       (async () => {
//         const el = await driver.wait(until.elementLocated(By.xpath(successXPath)), 20000).catch(() => null);
//         return el ? 'success' : null;
//       })(),
//       (async () => {
//         const el = await driver.wait(until.elementLocated(By.xpath(errorXPath)), 20000).catch(() => null);
//         return el ? 'error' : null;
//       })(),
//     ]);

//     if (winner === 'error') {
//       let errText = 'Unknown update error';
//       try {
//         const el = await driver.findElement(By.xpath(errorXPath));
//         errText = await el.getText();
//       } catch {}
//       throw new Error(`Batch update failed: ${errText}`);
//     }

//     // Ensure dialog is closed
//     await driver.wait(async () => {
//       const els = await driver.findElements(By.xpath("//div[@role='dialog']//*[normalize-space(.)='Edit Batch']"));
//       return els.length === 0;
//     }, 20000);

//     // Optionally click Refresh to reload table
//     try {
//       const refreshBtn = await driver.findElement(By.xpath("//button[normalize-space(.)='Refresh']"));
//       await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", refreshBtn);
//       await driver.wait(until.elementIsVisible(refreshBtn), 10000);
//       await driver.wait(until.elementIsEnabled(refreshBtn), 10000);
//       await refreshBtn.click();
//     } catch (_) {}

//     // Assert the row now shows the updated code (column 2) and optionally name (column 1)
//     await driver.wait(
//       until.elementLocated(
//         By.xpath("//tbody/tr[td[2][normalize-space(.)='IT25']]")
//       ),
//       20000
//     );
//   });

//   after(async function () {
//     if (driver) {
//       await driver.quit();
//     }
//   });
// });


