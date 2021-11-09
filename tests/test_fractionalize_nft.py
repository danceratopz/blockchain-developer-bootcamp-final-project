"""
Python unit tests for XyzCoin.sol.
"""
import pytest

from brownie import accounts, XyzCoin
import brownie.exceptions

@pytest.fixture(params=[1, 1000])
def total_supply(request):
    return request.param


@pytest.fixture
def deploy_address():
    return accounts[0]


@pytest.fixture
def xyz_contract(deploy_address, total_supply):
    return deploy_address.deploy(XyzCoin, total_supply)


def test_total_supply(xyz_contract, total_supply):
    total_supply_under_test = xyz_contract.totalSupply()
    assert total_supply_under_test == total_supply


def test_initial_balance(deploy_address, xyz_contract, total_supply):
    balance = xyz_contract.balanceOf(deploy_address)
    assert balance == total_supply


def test_transfer_valid_amount(deploy_address, xyz_contract):
    receiver_address = accounts[1]
    initial_balance = xyz_contract.balanceOf(receiver_address)
    assert initial_balance == 0
    amount = 1
    _ = xyz_contract.transfer(receiver_address, amount, {'from': deploy_address})
    # TODO: test transaction object?
    balance = xyz_contract.balanceOf(receiver_address)
    assert balance == amount

def test_transfer_invalid_amount(deploy_address, xyz_contract, total_supply):
    receiver_address = accounts[1]
    initial_balance = xyz_contract.balanceOf(receiver_address)
    assert initial_balance == 0
    amount = total_supply + 1
    with pytest.raises(brownie.exceptions.VirtualMachineError) as execinfo:
        _ = xyz_contract.transfer(receiver_address, amount).transact({'from': deploy_address})
    assert "transfer amount exceeds balance" in str(execinfo.value)
