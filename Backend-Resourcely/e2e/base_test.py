# backend/e2e/base_test.py
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import unittest

class BaseTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        options = webdriver.ChromeOptions()
        # options.add_argument("--headless=new")  # uncomment for CI/headless
        cls.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        cls.driver.set_window_size(1280, 900)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
