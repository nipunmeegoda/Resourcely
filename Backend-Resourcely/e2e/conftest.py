import os
import pytest

def pytest_addoption(parser):
    parser.addoption("--base-url", action="store", default=None,
                     help="Base URL for the app under test (e.g., http://localhost:5173)")

@pytest.fixture(scope="session")
def base_url(pytestconfig):
    return (pytestconfig.getoption("--base-url")
            or os.getenv("BASE_URL")
            or "http://localhost:5173")

# 👉 This is the magic bit: inject base_url onto unittest-style classes
@pytest.fixture(autouse=True)
def _inject_base_url(request, base_url):
    # request.cls is set for test classes; skip functions
    cls = getattr(request, "cls", None)
    if cls is not None:
        setattr(cls, "base_url", base_url)
