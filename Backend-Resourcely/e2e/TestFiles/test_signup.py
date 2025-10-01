# Backend-Resourcely/e2e/TestFiles/test_signup.py
from urllib.parse import urljoin
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from base_test import BaseTest


class TestSignUp(BaseTest):
    def go(self, path):
        base = self.base_url if self.base_url.endswith("/") else self.base_url + "/"
        self.driver.get(urljoin(base, path.lstrip("/")))

    def fill(self, locator, value):
        el = WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable(locator))
        el.clear()
        el.send_keys(value)
        return el

    def helper_text(self, field_id):
        # MUI sets helper id as {id}-helper-text
        try:
            el = self.driver.find_element(By.ID, f"{field_id}-helper-text")
            return (el.text or "").strip()
        except Exception:
            return ""

    def test_validation_and_submit(self):
        # 1) Open the signup page
        self.go("/signup")

        # Wait for heading “Sign up” so we know the page rendered
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Sign up']"))
        )

        # 2) Submit empty form -> expect validation errors
        submit = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    # robust match for MUI button with "Sign up" text
                    "//button[@type='submit' and (normalize-space()='Sign up' or .//text()[contains(., 'Sign up')])]"
                )
            )
        )
        submit.click()

        # Wait a moment for helper texts to render
        WebDriverWait(self.driver, 5).until(
            lambda d: any(
                t for t in [
                    self.helper_text("name"),
                    self.helper_text("email"),
                    self.helper_text("password")
                ]
            )
        )

        assert "Name is required" in self.helper_text("name")
        assert "Email is required" in self.helper_text("email")
        assert "Password is required" in self.helper_text("password")

        # 3) Enter invalid values to exercise specific messages

        # Name too short
        self.fill((By.ID, "name"), "J")
        submit.click()
        assert "at least 2 characters" in self.helper_text("name")

        # Weak password (missing complexity)
        self.fill((By.ID, "password"), "abc")  # < 6 chars
        submit.click()
        assert "at least 6 characters" in self.helper_text("password")

        # 4) Enter fully valid values
        self.fill((By.ID, "name"), "Nipun Meegoda")
        self.fill((By.ID, "email"), "nipun@example.com")
        # Meets your rules: >=6, has upper, lower, number, special, no name/email parts
        self.fill((By.ID, "password"), "GoodPass1!")

        # Small UX nudge: hit TAB to let MUI blur/validate field
        self.driver.switch_to.active_element.send_keys(Keys.TAB)

        # Errors should clear
        assert self.helper_text("name") == "" or " " not in self.helper_text("name")
        assert self.helper_text("email") == "" or " " not in self.helper_text("email")
        assert self.helper_text("password") == "" or " " not in self.helper_text("password")

        # ---- Install alert spy (DO NOT call native alert) & stub fetch BEFORE submit ----
        self.driver.execute_script("""
          (function(){
            // capture alert text(s) without opening native dialogs
            if (!window.__alerts) {
              window.__alerts = [];
              window.alert = function(msg){
                try { window.__alerts.push(String(msg)); } catch(e) {}
              };
            }
          })();
        """)

        # Optional: stub fetch to avoid backend dependency/timing
        self.driver.execute_script("""
          (function(){
            const mockOk = true;  // set to false to simulate server error path
            const mockBody = mockOk ? { message: "ok" } : { error: "bad" };

            const ResponseShim = function(body, init){
              this.ok = !!init.ok;
              this.status = init.status || (this.ok ? 200 : 400);
              this.json = async () => body;
            };

            window.fetch = async function(){
              return new ResponseShim(mockBody, { ok: mockOk, status: mockOk ? 200 : 400 });
            };
          })();
        """)

        # Submit the form
        submit.click()

        # Wait until our spy saw an alert
        last_alert = WebDriverWait(self.driver, 20).until(
            lambda d: d.execute_script("""
              if (window.__alerts && window.__alerts.length) {
                return window.__alerts[window.__alerts.length - 1];
              }
              return null;
            """)
        )

        # Debug: show what we actually captured
        print("DEBUG ALERT TEXT:", last_alert)

        # Assert it contains one of the expected messages
        assert any(kw in last_alert for kw in [
            "Registration successful",
            "Registration failed",
            "Network error"
        ]), f"Unexpected alert text: {last_alert!r}"
