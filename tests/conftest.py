"""
Unit test configuration and helpers (fixtures).
"""
import pytest
from brownie import accounts


@pytest.fixture(scope="session")
def deployer_address():
    return accounts[0]


@pytest.fixture(scope="session")
def user_address():
    return accounts[1]
