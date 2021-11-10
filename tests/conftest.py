"""
Unit test configuration and helpers (fixtures).
"""
import pytest


@pytest.fixture(scope="session")
def deployer_address(accounts):
    return accounts[0]


@pytest.fixture(scope="session")
def user_address(accounts):
    return accounts[1]


@pytest.fixture(scope="session")
def buyer_address(accounts):
    return accounts[2]


@pytest.fixture(scope="class", autouse=True)
def shared_setup(module_isolation):
    pass
