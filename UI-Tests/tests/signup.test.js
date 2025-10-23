// const { Builder, By, until } = require("selenium-webdriver");
// const chrome = require("selenium-webdriver/chrome");
// const { describe, it, before, after } = require("mocha");

// describe("Signup Flow", function () {
//   this.timeout(90000); // generous for first load + network

//   let driver;
//   const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

//   before(async function () {
//     const options = new chrome.Options();
//     if (process.env.HEADLESS !== "false") {
//       options.addArguments("--headless=new", "--disable-gpu", "--window-size=1280,800");
//     }
//     const service = new chrome.ServiceBuilder(require("chromedriver").path);

//     driver = await new Builder()
//       .forBrowser("chrome")
//       .setChromeOptions(options)
//       .setChromeService(service)
//       .build();

//     await driver.manage().setTimeouts({ pageLoad: 25000, implicit: 5000, script: 7000 });
//   });

//   it("signs up a new user successfully", async function () {
//     // Go directly to signup page
//     await driver.get(`${BASE_URL}/signup`);

//     // Wait for document readiness
//     await driver.wait(async () => {
//       try {
//         const state = await driver.executeScript("return document.readyState");
//         return state === "complete" || state === "interactive";
//       } catch {
//         return false;
//       }
//     }, 10000);

//     // Wait for the signup page content to render
//     await driver.wait(
//       until.elementLocated(By.xpath("//*[normalize-space(text())='Sign up']")),
//       15000
//     );

//     // Generate a unique email to avoid duplicates
//     const ts = Date.now();
//     const name = "Selenium User";
//     const email = `selenium.${ts}@example.com`;
//     const password = "Qw3r!Ty9"; // meets complexity and doesn't include name/email parts

//     // Fill the form (wait for inputs to be present and visible)
//     const nameInput = await driver.wait(until.elementLocated(By.id("name")), 15000);
//     await driver.wait(until.elementIsVisible(nameInput), 5000);
//     await nameInput.clear();
//     await nameInput.sendKeys(name);

//     const emailInput = await driver.wait(until.elementLocated(By.id("email")), 15000);
//     await driver.wait(until.elementIsVisible(emailInput), 5000);
//     await emailInput.clear();
//     await emailInput.sendKeys(email);

//     const passwordInput = await driver.wait(until.elementLocated(By.id("password")), 15000);
//     await driver.wait(until.elementIsVisible(passwordInput), 5000);
//     await passwordInput.clear();
//     await passwordInput.sendKeys(password);

//     // ✅ Form-scoped submit button
//     const formEl = await driver.findElement(By.css('form'));
//     const submitBtn = await formEl.findElement(By.css('button[type="submit"]'));
//     await submitBtn.click();

//     // Poll page text for success or error messages (robust against toast DOM structure)
//     const successText = "Registration successful! You can now log in.";
//     const errorHints = [
//       "Registration failed",
//       "Network error",
//       "already exists",
//       "Invalid",
//       "Error",
//       "[object Object]",
//     ];
//     const deadline = Date.now() + 20000;
//     let lastPageText = "";
//     let sawSuccess = false;
//     let sawError = "";
//     while (Date.now() < deadline && !sawSuccess && !sawError) {
//       try {
//         lastPageText = await driver.executeScript(
//           "return document.body ? document.body.innerText : ''"
//         );
//       } catch {
//         lastPageText = "";
//       }

//       if (lastPageText && lastPageText.includes(successText)) {
//         sawSuccess = true;
//         break;
//       }
//       for (const hint of errorHints) {
//         if (lastPageText && lastPageText.includes(hint)) {
//           sawError = hint;
//           break;
//         }
//       }
//       await driver.sleep(300);
//     }

//     if (!sawSuccess) {
//       throw new Error(
//         `Signup did not succeed. ${sawError || "Unknown signup error"}\nPage text snippet: ${
//           (lastPageText || "").slice(0, 500)
//         }`
//       );
//     }
//   });

//   after(async function () {
//     if (driver) {
//       await driver.quit();
//     }
//   });
// });
