"""
Python unit tests for FractionalizeNFT
"""
import pytest
from brownie import FractionalizeNFT, TestNFT, accounts


@pytest.fixture  # (params=[1, 1000])
def total_supply(request):
    return 1000


@pytest.fixture
def frac(deployer_address):
    return deployer_address.deploy(FractionalizeNFT)


@pytest.fixture
def nft_contract(deployer_address):
    nft_contract = deployer_address.deploy(TestNFT)
    return nft_contract


@pytest.fixture
def nft_id(nft_contract, deployer_address, user_address):
    tx = nft_contract.mintNFT(user_address, "www.foo.xyz", {"from": deployer_address})
    token_id = tx.return_value
    return token_id


@pytest.fixture
def fractionalized_nft(nft, nft_id, user_address):
    tx = frac.fractionalizeNft(nft, nft_id, 100, "Woof Coin", "WOOF", {"from": user_address})
    erc20_address = tx.return_value
    return erc20_address


class TestTestNFT:
    def test_mint_nft(self, nft_contract, nft_id, user_address):
        assert user_address == nft_contract.ownerOf(nft_id)

    def test_transfer_nft(self, nft_id, nft_contract, user_address):
        receiver_address = accounts[2]
        nft_contract.safeTransferFrom(user_address, receiver_address, nft_id, {"from": user_address})
        assert receiver_address == nft_contract.ownerOf(nft_id)


class TestFractionalizeNFT:
    pass
