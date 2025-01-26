const path = require("path");
const fs = require("fs");
const solc = require("solc");

const loteryPath = path.resolve(__dirname, "contracts", "Lotery.sol");
const source = fs.readFileSync(loteryPath, "utf8");

const input = {
    language: "Solidity",
    sources: {
        "Lotery.sol": {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

let output = JSON.parse(solc.compile(JSON.stringify(input)));
module.exports = output.contracts["Lotery.sol"].Lotery;
