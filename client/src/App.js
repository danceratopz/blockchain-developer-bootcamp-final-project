import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainid: null,
        fractionalizeNFT: null,
        fracNFTId: null,
        fracNFTCount: null,
        owner: null,
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
        const fractionalizeNFT = await this.loadContract(_chainID, "FractionalizeNFT")
        if (!fractionalizeNFT) {
            return
        }

        const fracNFTCount = await fractionalizeNFT.methods.getFracNFTCount().call()
        console.log(fracNFTCount)
        const owner = await fractionalizeNFT.methods.owner().call()
        this.setState({
            fractionalizeNFT: fractionalizeNFT,
            fracNFTCount: fracNFTCount,
            owner: owner,
        })
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }

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

    changeSolidity = async (e) => {
        const {web3, accounts, fractionalizeNFT, fracNFTId, fracNFTCount} = this.state
        e.preventDefault()
        const fracNFTId_input = parseInt(fracNFTId)
        if (isNaN(fracNFTId_input)) {
            alert("invalid value")
            return
        }
        await fractionalizeNFT.methods.getFracNFTCount().call()
            .on('receipt', async () => {
                this.setState({
                    fracNFT: fractionalizeNFT.methods.getFracNFT(fracNFTId_input).call()
                })
            })
        // await fractionalizeNFT.methods.buyout(fracNFTId_input).send({from: accounts[0], value: web3.utils.toWei("10", "ether")})
        //     .on('receipt', async () => {
        //         this.setState({
        //             fracNFTId: 1  //await fractionalizeNFT.methods.getERC20Address(value).call()
        //         })
        //     })
    }

    render() {
        const {
            web3, accounts, chainid,
            fractionalizeNFT,
            fracNFTId,
            fracNFTCount,
            owner,
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        // <=42 to exclude Kovan, <42 to include Kovan
        if (isNaN(chainid) || chainid < 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        //if (!vyperStorage || !solidityStorage) {
        if (!fractionalizeNFT) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false

        return (<div className="App">
                <h1>Fractionalize NFT ({owner}, {accounts[0]})</h1>
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page to
                        be able to edit the storage fields.</strong>
                    </p>
                    : null
            }

            <h2>Claim Share following a Buyout </h2>
            <div>Number of NFTs that have been fractionalized: {fracNFTCount}</div>
                <br/>
            <form onSubmit={(e) => this.changeSolidity(e)}>
                <div>
                    <label>Select Fractionalized NFT Id: </label>
                    <br/>
                    <input
                        name="fracNFTId"
                        type="text"
                        value={fracNFTId}
                        onChange={(e) => this.setState({fracNFTId: e.target.value})}
                    />
                    <button type="submit" disabled={!isAccountsUnlocked}>Submit</button>

                </div>
                </form>
                // <div>Fractionalized NFT state: {}  </div>
        </div>)
    }
}

export default App
