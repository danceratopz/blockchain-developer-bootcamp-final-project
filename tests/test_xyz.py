"""
Python unit tests for XyzCoin.sol.
"""
import pytest

from brownie import accounts, XyzCoin


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

# def test_transfer_invalid_amount(eth_tester, w3, deploy_address, xyz_contract, total_supply):
#     receiver_address = eth_tester.get_accounts()[1]
#     initial_balance = xyz_contract.functions.balanceOf(receiver_address)
#     assert initial_balance == 0
#     amount = total_supply + 1
#     with pytest.raises(TransactionFailed) as execinfo:
#         _ = xyz_contract.functions.transfer(receiver_address,
#                                             amount).transact({'from': deploy_address})
#     assert "transfer amount exceeds balance" in str(execinfo.value)

# @pytest.mark.xfail(reason="Experimenting with test reports")
# def test_fail_for_test_report(xyz_contract, total_supply):
#     total_supply_under_test = xyz_contract.functions.totalSupply().call()
#     assert total_supply_under_test == total_supply + 1

# @pytest.mark.skip(reason="Experimenting with test reports")
# def test_skip_for_test_report(total_supply):
#     assert 0

# @pytest.mark.xfail(reason="Experimenting with test reports")
# def test_xfail_for_test_report(total_supply):
#     assert 0
