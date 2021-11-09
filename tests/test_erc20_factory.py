"""
Python unit tests for ERC20Factory
"""
import brownie.exceptions
import pytest
from brownie import ERC20Factory, accounts


class TestErc20Factory:
    @pytest.fixture
    def total_supply(self):
        return 1000

    @pytest.fixture
    def xyz_contract(self, deployer_address, total_supply):
        return deployer_address.deploy(ERC20Factory, "XYZ Coin", "XYZ", total_supply, deployer_address)

    def test_total_supply(self, xyz_contract, total_supply):
        total_supply_under_test = xyz_contract.totalSupply()
        assert total_supply_under_test == total_supply

    def test_initial_balance(self, deployer_address, xyz_contract, total_supply):
        balance = xyz_contract.balanceOf(deployer_address)
        assert balance == total_supply

    def test_transfer_valid_amount(self, deployer_address, xyz_contract):
        receiver_address = accounts[1]
        initial_balance = xyz_contract.balanceOf(receiver_address)
        assert initial_balance == 0
        amount = 1
        _ = xyz_contract.transfer(receiver_address, amount, {"from": deployer_address})
        # TODO: test transaction object?
        balance = xyz_contract.balanceOf(receiver_address)
        assert balance == amount

    def test_transfer_invalid_amount(self, deployer_address, xyz_contract, total_supply):
        receiver_address = accounts[1]
        initial_balance = xyz_contract.balanceOf(receiver_address)
        assert initial_balance == 0
        amount = total_supply + 1
        with pytest.raises(brownie.exceptions.VirtualMachineError) as execinfo:
            _ = xyz_contract.transfer(receiver_address, amount).transact({"from": deployer_address})
        assert "transfer amount exceeds balance" in str(execinfo.value)
