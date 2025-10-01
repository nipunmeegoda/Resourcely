from selenium.webdriver.common.by import By
from base_test import BaseTest

class TestHomePage(BaseTest):
    def test_homepage_buttons(self):
        self.driver.get(self.base_url)

        heading = self.driver.find_element(By.TAG_NAME, "h1")
        assert "Welcome to Resourcely" in heading.text

        login_btn = self.driver.find_element(By.ID, "login-btn")
        login_btn.click()
        assert "/login" in self.driver.current_url

        self.driver.back()

        register_btn = self.driver.find_element(By.ID, "register-btn")
        register_btn.click()
        assert "/signup" in self.driver.current_url
