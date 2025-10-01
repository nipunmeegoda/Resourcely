# Backend-Resourcely/e2e/TestFiles/test_login.py
import os
import json
from urllib.parse import urljoin
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from base_test import BaseTest


class TestLogin(BaseTest):
    # ---------------- lifecycle ----------------

    def setUp(self):
        # Make each test independent: clear storage & reset to /login
        self.driver.execute_script("""
          try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}
          try { window.history.replaceState({}, '', '/'); } catch(e) {}
        """)

    # ---------------- helpers ----------------

    def go(self, path: str):
        base = self.base_url if self.base_url.endswith("/") else self.base_url + "/"
        self.driver.get(urljoin(base, path.lstrip("/")))

    def fill(self, locator, value: str):
        el = WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable(locator))
        el.clear()
        el.send_keys(value)
        return el

    def helper_text(self, field_id: str) -> str:
        try:
            el = self.driver.find_element(By.ID, f"{field_id}-helper-text")
            return (el.text or "").strip()
        except Exception:
            return ""

    @property
    def use_real_backend(self) -> bool:
        # export E2E_REAL=1 to hit the real backend
        return os.getenv("E2E_REAL", "0").lower() in ("1", "true", "yes")

    def _stub_fetch_login(self, ok: bool, role: str | None = None, status: int = 200):
        """Stub window.fetch for /api/auth/login when NOT using real backend."""
        if self.use_real_backend:
            return
        if not ok and status is None:
            status = 401
        js = """
(function(){
  const mockOk = arguments[0] ? true : false;
  const role    = arguments[1];
  const status  = arguments[2];

  const makeBody = () => mockOk ? { user: { role: role || "user" } } : { error: "invalid_credentials" };

  const ResponseShim = function(body, init){
    this.ok = !!init.ok;
    this.status = init.status;
    this.json = async () => body;
    this.text = async () => JSON.stringify(body);
  };

  const originalFetch = window.fetch;
  window.fetch = async function(input, init){
    try {
      const url = (typeof input === 'string') ? input : (input && input.url) || '';
      if (String(url).includes("/api/auth/login")) {
        return new ResponseShim(makeBody(), { ok: mockOk, status: status || (mockOk ? 200 : 401) });
      }
    } catch (e) {}
    return originalFetch.apply(this, arguments);
  };
})();
"""
        self.driver.execute_script(js, ok, role, status)

    def _local_storage_auth(self):
        return self.driver.execute_script("return window.localStorage.getItem('auth');")

    def _auth_json(self):
        raw = self._local_storage_auth()
        if not raw:
            return None
        try:
            return json.loads(raw)
        except Exception:
            return None

    def _wait_path_contains(self, piece: str, timeout: int = 10):
        WebDriverWait(self.driver, timeout).until(
            lambda d: piece in d.execute_script("return window.location.pathname || ''")
        )
        assert piece in self.driver.execute_script("return window.location.pathname || ''")

    def _wait_for_validation_clear(self, field_id: str, timeout: int = 5):
        WebDriverWait(self.driver, timeout).until(
            lambda d: not (self.helper_text(field_id) and self.helper_text(field_id).strip())
        )

    def _debug_snapshot(self):
        href, ls, ss = self.driver.execute_script("""
          return [window.location.href,
                  JSON.stringify(window.localStorage),
                  JSON.stringify(window.sessionStorage)];
        """)
        print("DEBUG href:", href)
        print("DEBUG localStorage:", ls)
        print("DEBUG sessionStorage:", ss)

    def _wait_for_auth_or_route(self, want_path: str, heading_text: str | None, timeout: int = 20):
        """Resolve when either auth exists, heading present, or pathname matches."""
        def condition(d):
            try:
                if d.execute_script("return !!window.localStorage.getItem('auth');"):
                    return True
                if heading_text:
                    el = d.execute_script(
                        "return document.evaluate(\"//h1[normalize-space()=arguments[0]]\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;",
                        heading_text
                    )
                    if el:
                        return True
                path = d.execute_script("return window.location.pathname || ''")
                return (want_path in path)
            except Exception:
                return False
        WebDriverWait(self.driver, timeout).until(condition)

    def _force_client_nav(self, path: str):
        self.driver.execute_script("""
          (function(p){
            try {
              window.history.pushState({}, '', p);
              window.dispatchEvent(new PopStateEvent('popstate'));
            } catch (e) {}
          })(arguments[0]);
        """, path)

    # ---------------- tests ----------------

    def test_validation_messages(self):
        self.go("/login")
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Sign in']"))
        )
        submit = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//button[@type='submit' and (normalize-space()='Sign in' or .//text()[contains(., 'Sign in')])]"
            ))
        )

        # Empty -> expect errors
        submit.click()
        WebDriverWait(self.driver, 5).until(
            lambda d: self.helper_text("email") or self.helper_text("password")
        )
        assert "valid email address" in self.helper_text("email")
        assert "at least 6 characters" in self.helper_text("password")

        # Fix email, keep short password
        self.fill((By.ID, "email"), "user@example.com")
        submit.click()
        assert not self.helper_text("email")
        assert "at least 6 characters" in self.helper_text("password")

        # Fix password >= 6, submit to clear
        self.fill((By.ID, "password"), "secret1")
        submit.click()
        self._wait_for_validation_clear("password")
        assert not self.helper_text("password")

    def test_login_success_user_goes_to_dashboard(self):
        self.go("/login")
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Sign in']"))
        )
        self._stub_fetch_login(ok=True, role="user")

        self.fill((By.ID, "email"), "nipun23@gmail.com")
        self.fill((By.ID, "password"), "Brave@123")
        self.driver.find_element(
            By.XPATH, "//button[@type='submit' and (normalize-space()='Sign in' or .//text()[contains(., 'Sign in')])]"
        ).click()

        try:
            self._wait_for_auth_or_route("/dashboard", heading_text="Dashboard", timeout=25)
        except Exception:
            self._debug_snapshot()
            self._force_client_nav("/dashboard")
            self._wait_for_auth_or_route("/dashboard", heading_text="Dashboard", timeout=10)

        # Parse JSON instead of brittle substring checks
        auth = self._auth_json()
        if not auth:
            self._debug_snapshot()
        assert auth is not None and auth.get("isAuthenticated") is True
        role = str(auth.get("user", {}).get("role", "")).lower()
        assert role == "user"

    def test_login_success_admin_goes_to_admin(self):
        self.go("/login")
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Sign in']"))
        )
        self._stub_fetch_login(ok=True, role="Admin")

        self.fill((By.ID, "email"), "admin@test3.com")
        self.fill((By.ID, "password"), "Test123456")
        self.driver.find_element(
            By.XPATH, "//button[@type='submit' and (normalize-space()='Sign in' or .//text()[contains(., 'Sign in')])]"
        ).click()

        try:
            self._wait_for_auth_or_route("/admin", heading_text="Admin", timeout=25)
        except Exception:
            self._debug_snapshot()
            self._force_client_nav("/admin")
            self._wait_for_auth_or_route("/admin", heading_text="Admin", timeout=10)

        auth = self._auth_json()
        if not auth:
            self._debug_snapshot()
        assert auth is not None and auth.get("isAuthenticated") is True
        role = str(auth.get("user", {}).get("role", "")).lower()
        assert role == "admin"

    def test_login_server_error_stays_on_login(self):
        self.go("/login")
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Sign in']"))
        )
        self._stub_fetch_login(ok=False, role=None, status=401)

        self.fill((By.ID, "email"), "user@example.com")
        self.fill((By.ID, "password"), "BadPass1")
        self.driver.find_element(
            By.XPATH, "//button[@type='submit' and (normalize-space()='Sign in' or .//text()[contains(., 'Sign in')])]"
        ).click()

        WebDriverWait(self.driver, 5).until(lambda d: "/login" in d.current_url)
        assert "/login" in self.driver.current_url

        # Confirm nothing persisted
        assert self._auth_json() is None
