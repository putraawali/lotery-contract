require("dotenv").config();
const HdWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");
const { abi, evm } = require("./compile");

const provider = new HdWalletProvider({
    mnemonic: process.env.MNEMONIC,
    url: process.env.SEPOLIA_URL,
});

const web3 = new Web3(provider);

async function deploy() {
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account", accounts[0]);

    const result = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object,
        })
        .send({
            from: accounts[0],
            gas: "1000000",
        });

    console.log("Contract deployed to", result.options.address);

    provider.engine.stop();
}

deploy();
