"""
Python unit tests for FractionalizeNFT
"""
import math
import brownie.exceptions
import pytest
from brownie import Wei


@pytest.fixture(scope="class")
def nft_contract(TestNFT, deployer_address):
    nft_contract = deployer_address.deploy(TestNFT)
    return nft_contract


@pytest.fixture(scope="class")
def mint_nft(nft_contract, deployer_address, user_address):
    tx = nft_contract.mintNFT(user_address, "www.foo.xyz", {"from": deployer_address})
    return tx


@pytest.fixture(scope="class")
def nft_id(mint_nft):
    return mint_nft.return_value


class TestTestNFT:
    def test_mint_nft(self, nft_contract, nft_id, user_address):
        assert user_address == nft_contract.ownerOf(nft_id)

    def test_transfer_nft(self, nft_id, nft_contract, user_address, accounts):
        receiver_address = accounts[2]
        nft_contract.safeTransferFrom(user_address, receiver_address, nft_id, {"from": user_address})
        assert receiver_address == nft_contract.ownerOf(nft_id)


class TestFractionalizeNFT:
    @pytest.fixture(scope="class")
    def erc20_name(self):
        return "Woof coin"

    @pytest.fixture(scope="class")
    def erc20_symbol(self):
        return "WOOF"

    @pytest.fixture(scope="class")
    def erc20_supply(self):
        return 100

    @pytest.fixture(scope="class")
    def buyout_price(self):
        return "5 ether"

    @pytest.fixture(scope="class")
    def frac_contract(self, deployer_address, FractionalizeNFT):
        return deployer_address.deploy(FractionalizeNFT)

    @pytest.fixture(scope="class", autouse=True)
    def create_fractionalized_nft(
        self, frac_contract, nft_contract, nft_id, user_address, erc20_name, erc20_symbol, erc20_supply, buyout_price
    ):
        nft_contract.approve(frac_contract.address, nft_id, {"from": user_address})
        tx = frac_contract.fractionalizeNft(
            nft_contract, nft_id, erc20_name, erc20_symbol, erc20_supply, buyout_price, {"from": user_address}
        )
        return tx

    @pytest.fixture(scope="class", autouse=True)
    def frac_nft_id(self, create_fractionalized_nft):
        return create_fractionalized_nft.return_value

    @pytest.fixture
    def erc20_contract(self, frac_nft_id, frac_contract, ERC20Factory, Contract):
        tx = frac_contract.getERC20Address(frac_nft_id)
        erc20_address = tx.return_value
        tx = frac_contract.getERC20Symbol(frac_nft_id)
        erc20_symbol = tx.return_value
        return Contract.from_abi(erc20_symbol, erc20_address, ERC20Factory.abi)

    # TODO: Implement reasonable test of receive function
    def test_receive(self, user_address, frac_contract):
        user_address.transfer(frac_contract.address, "1 ether")

    # TODO: Implement test of fallback function
    @pytest.mark.xfail
    def test_fallback(self):
        assert 0, "unimplemented"

    def test_erc20_total_supply(self, erc20_contract, erc20_supply):
        assert erc20_contract.totalSupply() == erc20_supply

    def test_erc20_initial_balance(self, erc20_contract, user_address, erc20_supply):
        assert erc20_contract.balanceOf(user_address) == erc20_supply

    def test_erc20_name(self, erc20_contract, erc20_name):
        assert erc20_contract.name() == erc20_name

    def test_erc20_symbol(self, erc20_contract, erc20_symbol):
        assert erc20_contract.symbol() == erc20_symbol

    def test_nft_owner(self, nft_contract, nft_id, frac_contract):
        assert nft_contract.ownerOf(nft_id) == frac_contract.address

    @pytest.mark.usefixtures("fn_isolation")
    def test_buyout_valid_price(
        self,
        frac_contract,
        nft_contract,
        erc20_contract,
        buyer_address,
        frac_nft_id,
        nft_id,
        buyout_price,
        user_address,
    ):
        frac_contract_initial_balance = frac_contract.balance()
        tx = frac_contract.buyout(frac_nft_id, {"from": buyer_address, "value": buyout_price})
        assert "BoughtOut" in tx.events
        assert nft_contract.ownerOf(nft_id) == buyer_address
        contract_expected_balance = frac_contract_initial_balance + buyout_price
        # NOTE: integer comparison
        assert frac_contract.balance() == contract_expected_balance
        user_initial_balance = user_address.balance()
        erc20_contract.approve(frac_contract.address, erc20_contract.balanceOf(user_address), {"from": user_address})
        tx = frac_contract.claim(frac_nft_id, {"from": user_address})
        assert "Claimed" in tx.events
        user_expected_balance = user_initial_balance + buyout_price
        assert user_address.balance() == user_expected_balance

    @pytest.mark.usefixtures("fn_isolation")
    def test_buyout_multiple_claimers(
        self,
        frac_contract,
        nft_contract,
        buyer_address,
        frac_nft_id,
        nft_id,
        buyout_price,
        user_address,
        accounts,
        erc20_contract,
    ):
        # TODO: Split test more appropriately into setup and test code.
        frac_contract_initial_balance = frac_contract.balance()
        tx = frac_contract.buyout(frac_nft_id, {"from": buyer_address, "value": buyout_price})
        assert "BoughtOut" in tx.events
        assert nft_contract.ownerOf(nft_id) == buyer_address
        contract_expected_balance = frac_contract_initial_balance + buyout_price
        assert frac_contract.balance() == contract_expected_balance
        new_token_holders = [accounts[i] for i in range(5, 10)]
        for i, token_holder in enumerate(new_token_holders):
            x = math.floor(erc20_contract.totalSupply() / ((i + 1) * len(new_token_holders)))
            erc20_contract.transfer(token_holder, x, {"from": user_address})
            initial_balance = token_holder.balance()
            print(token_holder.address, initial_balance, erc20_contract.balanceOf(token_holder))
            expected_balance = (
                initial_balance
                + Wei(buyout_price) * erc20_contract.balanceOf(token_holder) / erc20_contract.totalSupply()
            )
            erc20_contract.approve(
                frac_contract.address, erc20_contract.balanceOf(token_holder), {"from": token_holder}
            )
            frac_contract.claim(frac_nft_id, {"from": token_holder})
            assert expected_balance == token_holder.balance()
        user_initial_balance = user_address.balance()
        user_expected_balance = (
            user_initial_balance
            + Wei(buyout_price) * erc20_contract.balanceOf(user_address) / erc20_contract.totalSupply()
        )
        erc20_contract.approve(frac_contract.address, erc20_contract.balanceOf(user_address), {"from": user_address})
        tx = frac_contract.claim(frac_nft_id, {"from": user_address})
        assert "Claimed" in tx.events
        assert user_address.balance() == user_expected_balance

    @pytest.mark.usefixtures("fn_isolation")
    def test_buyout_invalid_price(self, frac_contract, nft_contract, buyer_address, frac_nft_id, nft_id, buyout_price):
        contract_initial_balance = frac_contract.balance()
        buyer_initial_balance = buyer_address.balance()
        with brownie.reverts("Sender sent less than the buyout price."):
            frac_contract.buyout(frac_nft_id, {"from": buyer_address, "value": "3 ether"})
        assert nft_contract.ownerOf(nft_id) == frac_contract.address
        assert frac_contract.balance() == contract_initial_balance
        assert buyer_address.balance() == buyer_initial_balance
