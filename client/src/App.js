import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import Erc20Factory from "./artifacts/contracts/ERC20Factory.json"
import TestNft from "./artifacts/contracts/TestNFT.json"
import {getEthereum} from "./getEthereum"

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainid: null,
        fractionalizeNFT: null,
        fractionalizeNFTAddress: null,
        fracNFTId: null,
        fracNFTCount: null,
    }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        try {
            const ethereum = await getEthereum()
            ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        const accounts = await web3.eth.getAccounts()

        // Get the current chain id
        const chainid = parseInt(await web3.eth.getChainId())

        this.setState({
            web3,
            accounts,
            chainid
        }, await this.loadInitialContracts)

    }

    loadInitialContracts = async () => {
        // <=42 to exclude Kovan, <42 to include kovan
        if (this.state.chainid < 42) {
            // Wrong Network!
            return
        }
        console.log(this.state.chainid)

        var _chainID = 0;
        if (this.state.chainid === 42){
            _chainID = 42;
        }
        if (this.state.chainid === 1337){
            _chainID = "dev"
        }
        console.log(_chainID)
        const fractionalizeNFTAddress = await this.getContractAddress(_chainID, "FractionalizeNFT")
        const fractionalizeNFT = await this.loadContract(_chainID, fractionalizeNFTAddress)
        if (!fractionalizeNFT) {
            return
        }

        const fracNFTCount = await fractionalizeNFT.methods.fracNFTCount().call()
        console.log(fracNFTCount)
        this.setState({
            fractionalizeNFT: fractionalizeNFT,
            fractionalizeNFTAddress: fractionalizeNFTAddress,
            fracNFTCount: fracNFTCount
        })
    }

    getContractAddress = async (chain, contractName) => {
        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }
        return address
    }

    loadContract = async (chain, address) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state        
        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }
        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    interactApproveNftContract = async (e) => {
        const {web3,
               accounts,
               fractionalizeNFT,
               fractionalizeNFTAddress,
               nftContractAddress,
               nftTokenId,
              } = this.state
        e.preventDefault()
        const nftTokenId_i = parseInt(nftTokenId)
        var nftContractInstance = await new web3.eth.Contract(TestNft.abi, nftContractAddress)
        await nftContractInstance.methods.approve(fractionalizeNFTAddress,
                                                  nftTokenId_i).send({"from": accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    fracNFTCount: await fractionalizeNFT.methods.fracNFTCount().call()
                })
            })
    }

    interactApproveErcContract = async (e) => {
        const {web3,
               accounts,
               fractionalizeNFT,
               fractionalizeNFTAddress,
               fracNFTId
              } = this.state
        e.preventDefault()
        const fracNFTId_i = parseInt(fracNFTId)
        const erc20FactoryAddress = await fractionalizeNFT.methods.getERC20Address(fracNFTId_i).call()
        console.log("Got ERC20 Token Address:")
        console.log(erc20FactoryAddress)
        var ercContractInstance = await new web3.eth.Contract(Erc20Factory.abi, erc20FactoryAddress)
        var balance = await ercContractInstance.methods.balanceOf(accounts[0]).call()
        await ercContractInstance.methods.approve(fractionalizeNFTAddress,
                                                  balance).send({"from": accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    fracNFTCount: await fractionalizeNFT.methods.fracNFTCount().call()
                })
            })
    }

    interactFractionalizeNft = async (e) => {
        const {web3,
               accounts,
               fractionalizeNFT,
               nftContractAddress,
               nftTokenId,
               erc20Symbol,
               erc20Name,
               erc20Supply,
               buyoutPrice              } = this.state
        e.preventDefault()
        const nftTokenId_i = parseInt(nftTokenId)
        const erc20Supply_i = parseInt(erc20Supply)
        const buyoutPrice_wei = web3.utils.toWei(buyoutPrice, "ether")
        await fractionalizeNFT.methods.fractionalizeNft(nftContractAddress,
                                                        nftTokenId_i,
                                                        erc20Name,
                                                        erc20Symbol,
                                                        erc20Supply_i,
                                                        buyoutPrice_wei).send({"from": accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    fracNFTCount: await fractionalizeNFT.methods.fracNFTCount().call()
                })
            })
    }

    interactBuyout = async (e) => {
        const {web3,
               accounts,
               fractionalizeNFT,
               nftFracId,
               buyoutPrice
              } = this.state
        e.preventDefault()
        const buyoutPrice_wei = web3.utils.toWei(buyoutPrice, "ether")
        await fractionalizeNFT.methods.buyout(nftFracId,
                                             ).send({"from": accounts[0], "value": buyoutPrice_wei})
            .on('receipt', async () => {
                this.setState({
                    fracNFTCount: await fractionalizeNFT.methods.fracNFTCount().call()
                })
            })
    }

    interactClaim = async (e) => {
        const {accounts,
               fractionalizeNFT,
               fracNFTId
              } = this.state
        e.preventDefault()
        await fractionalizeNFT.methods.claim(fracNFTId).send({"from": accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    fracNFTCount: await fractionalizeNFT.methods.fracNFTCount().call()
                })
            })
    }


    interactRedeem = async (e) => {
        const {accounts,
               fractionalizeNFT,
               nftFracId,
              } = this.state
        e.preventDefault()
        await fractionalizeNFT.methods.redeem(nftFracId).send({"from": accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    fracNFTCount: await fractionalizeNFT.methods.fracNFTCount().call()
                })
            })
    }

    render() {
        const {
            web3, accounts, chainid,
            fractionalizeNFT,
            fracNFTId,
            fracNFTCount,
            nftContractAddress,
            nftFracId,
            nftTokenId,
            erc20Name,
            erc20Symbol,
            erc20Supply,
            buyoutPrice,
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        // <=42 to exclude Kovan, <42 to include Kovan
        if (isNaN(chainid) || chainid < 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!fractionalizeNFT) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false

        return (<div className="App">
                
                <h1>Fractionalize NFT</h1>
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page to
                        be able to edit the storage fields.</strong>
                    </p>
                    : null
            }
            <div>Number of NFTs that have been fractionalized: {fracNFTCount}</div>
                <br/>

            <h2>Fractionalize:</h2>
                <p>Fractionalize an NFT</p>
            <form onSubmit={(e) => this.interactFractionalizeNft(e)}>
                <div>
                    <label></label>
                    <br/>
                    <input
                        name="nftContractAddress"
                        placeholder="NFT contract address (string, 0x...)"
                        type="text"
                        value={nftContractAddress}
                        onChange={(e) => this.setState({nftContractAddress: e.target.value})}
                    />
                    <input
                        name="nftTokenId"
                        placeholder="NFT token id (integer)"
                        type="text"
                        value={nftTokenId}
                        onChange={(e) => this.setState({nftTokenId: e.target.value})}
                    />
                    <br/>
                    <input
                        name="erc20Symbol"
                        placeholder="ERC20 symbol (string)"
                        type="text"
                        value={erc20Symbol}
                        onChange={(e) => this.setState({erc20Symbol: e.target.value})}
                    />
                    <input
                        name="erc20Name"
                        placeholder="ERC20 name (string)"
                        type="text"
                        value={erc20Name}
                        onChange={(e) => this.setState({erc20Name: e.target.value})}
                    />
                    <input
                        name="erc20Supply"
                        placeholder="ERC20 supply (integer)"
                        type="text"
                        value={erc20Supply}
                        onChange={(e) => this.setState({erc20Supply: e.target.value})}
                    />
                    <br/>
                    <input
                        name="buyoutPrice"
                        placeholder="Buyout price (Ether)"
                        type="text"
                        value={buyoutPrice}
                        onChange={(e) => this.setState({buyoutPrice: e.target.value})}
                    />
                    <button
                      onClick={this.interactApproveNftContract.bind(this)}
                      type="submit"
                      name="Approve"
                      disabled={!isAccountsUnlocked}>
                      Approve
                    </button>
                    <button
                      type="submit"
                      name="Fractionalise"
                      disabled={!isAccountsUnlocked}>
                      Fractionalise
                    </button>
                </div>
                </form>
                <h2>Buyout</h2>
                <p>Buy a fractionalized NFT and become its sole owner.</p>
                <form onSubmit={(e) => this.interactBuyout(e)}>
                <div>
                    <label></label>
                    <br/>
                    <input
                        name="nftFracId"
                        placeholder="Fractionalised NFT Index (integer)"
                        type="text"
                        value={nftFracId}
                        onChange={(e) => this.setState({nftFracId: e.target.value})}
                    />
                    <input
                        name="buyoutPrice"
                        placeholder="Amount to pay (Ether)"
                        type="text"
                        value={buyoutPrice}
                    onChange={(e) => this.setState({buyoutPrice: e.target.value})}
                    />
                    <button
                      type="submit"
                      name="Buyout"
                      disabled={!isAccountsUnlocked}>
                      Buyout
                    </button>
                </div>
                </form>

                <h2>Claim</h2>
                <p>Claim your share of the proceeds following the buyout of an NFT you own tokens for.</p>
                <form onSubmit={(e) => this.interactClaim(e)}>
                <div>
                    <label></label>
                    <br/>
                    <input
                        name="fracNFTId"
                        placeholder="Fractionalised NFT Index (integer)"
                        type="text"
                        value={fracNFTId}
                        onChange={(e) => this.setState({fracNFTId: e.target.value})}
                    />
                    <button
                      onClick={this.interactApproveErcContract.bind(this)}
                      type="submit"
                      name="Approve"
                      disabled={!isAccountsUnlocked}>
                      Approve
                    </button>
                    <button type="submit" disabled={!isAccountsUnlocked}>Claim</button>
                </div>
                </form>

                <h2>Reedem</h2>
                <p>If you hold the entire ERC20 supply of a fractionalized NFT, you can redeem it for the NFT.</p>
                <form onSubmit={(e) => this.interactRedeem(e)}>
                <div>
                    <label></label>
                    <br/>
                    <input
                        name="nftFracId"
                        placeholder="Fractionalised NFT Index (integer)"
                        type="text"
                        value={nftFracId}
                        onChange={(e) => this.setState({nftFracId: e.target.value})}
                    />
                    <button type="submit" disabled={!isAccountsUnlocked}>Redeem</button>
                </div>
                </form>
                </div>)

    }
}

export default App
