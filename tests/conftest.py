"""
Unit test configuration and helpers (fixtures).
"""
import pytest
from brownie import accounts


@pytest.fixture
def deployer_address():
    return accounts[0]


@pytest.fixture
def user_address():
    return accounts[1]
