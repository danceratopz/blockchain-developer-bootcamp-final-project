"""
Script to help deploy the FractionalizeNFT and TestNFT contracts for local
testing and on the Ropsten testnet. 
"""

from brownie import accounts, network, TestNFT, FractionalizeNFT

frac_nfts = [
    {
        "name": "Sonic Zebra",
        "symbol": "ZEBRA",
        "price": "1.1 ether",
        "supply": 100 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/Qmd83vRyLntVjLkhaTcwmwMQaF54oPfWPwnEMat9WbxBiW",
    },  # 1
    {
        "name": "Digital Art #1",
        "symbol": "DART1",
        "price": "2.5 ether",
        "supply": 5 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmQtSDSCNdcrDHF6xxoCKkhU9MsbJU2HH9GnGGU2EF1X1r",
    },  # 0
    {
        "name": "Unicorn Sketch",
        "symbol": "UNCRN",
        "price": "1.0 ether",
        "supply": 10000 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmTehR1YxzAmJPdLDsUyE6HHDfYzn8ZwMevP25HrKyduRR",
    },  # 5
    {
        "name": "Aurora Borealis",
        "symbol": "AB",
        "price": "3.0 ether",
        "supply": 1000 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmZMsrhamhcNKLUn1ue7Yk7cEni2vnY6gBMM8xaDqF4hec",
    },  # 2
    {
        "name": "Cryptopunk #6529",
        "symbol": "6529",
        "price": "1.0 ether",
        "supply": 1000000 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmUJQBqXmXxBjes8Jm2MLrx3VqiHQEjVA3BDPuJot6sb2q",
    },  # 4
    {
        "name": "1988 Public Enemy Concert Ticket",
        "symbol": "PUB1",
        "price": "10.1 ether",
        "supply": 200 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmYcVco5aN3nhGKDuWXU5GtR5LTrQikD6YwXYPdxb7vt7W",
    },  # 6
    {
        "name": "Crypto Punk Future",
        "symbol": "NPUNK",
        "price": "2.5 ether",
        "supply": 10 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmeauvPUvaEtpXiuciBLEWFkZ4s4yDruWWKtnxGBgENfnn",
    },  # 3
    {
        "name": "Neon Origin",
        "symbol": "ORIGIN",
        "price": "0.1 ether",
        "supply": 20 * 10 ** 18,
        "tokenURI": "https://gateway.pinata.cloud/ipfs/QmSPDzMAwuenKc8dqQh5Ff5ywLrjSBzDYsGcBVymnKUZKz",
    },
]  # 7


def main_dev():
    """
    Deploy the FractionalizeNFT and TestNFT contracts; mint and fractionalize some
    NFTs ready for local (manual) testing.
    """
    if network.show_active() != "development":
        print(f"Incorrect network. Expected 'development', got {network.show_active}")
        return
    deploy_account = accounts[0]
    user_account = accounts[1]
    num_tokens_to_fractionalize = 4
    nft_contract = TestNFT.deploy({"from": deploy_account})
    frac_contract = FractionalizeNFT.deploy({"from": deploy_account})
    for i in range(0, len(frac_nfts)):
        if i < num_tokens_to_fractionalize:
            nft_token_index = i + 1
            nft_contract.mintNFT(user_account, frac_nfts[i]["tokenURI"], {"from": deploy_account})
            nft_contract.approve(frac_contract, nft_token_index, {"from": user_account})
            frac_contract.fractionalizeNft(
                nft_contract.address,
                nft_token_index,
                frac_nfts[i]["name"],
                frac_nfts[i]["symbol"],
                frac_nfts[i]["supply"],
                frac_nfts[i]["price"],
                {"from": user_account},
            )
        else:
            nft_contract.mintNFT(deploy_account, frac_nfts[i]["tokenURI"], {"from": deploy_account})
    return nft_contract, frac_contract


def main_test_nft():
    """
    Deploy the TestNFT contract to Ropsten.
    """
    if network.show_active() != "ropsten":
        print(f"ERROR: Incorrect network. Expected 'ropsten', got {network.show_active}")
        return
    account = accounts.load("deployment")
    test_nft_contract = TestNFT.deploy({"from": account}, publish_source=True)
    print(test_nft_contract)
    result = TestNFT[-1].get_verification_info()
    print(result)
    return test_nft_contract


def main_frac_nft():
    """
    Deploy the FractionalizeNFT contract to Ropsten.
    """
    if network.show_active() != "ropsten":
        print(f"ERROR: Incorrect network. Expected 'ropsten', got {network.show_active}")
        return
    account = accounts.load("deployment")
    frac_nft_contract = FractionalizeNFT.deploy({"from": account}, publish_source=True)
    print(frac_nft_contract)
    result = FractionalizeNFT[-1].get_verification_info()
    print(result)
    return frac_nft_contract


def main():
    """
    Deploy both the FractionalizeNFT and TestNFT contracts to Ropsten.
    """
    main_test_nft()
    main_frac_nft()
