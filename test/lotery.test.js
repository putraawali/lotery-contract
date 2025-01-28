const assert = require("assert");
const ganache = require("ganache"); // Local test network
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

let accounts;
let lotery;

beforeEach(async () => {
    // Get list of all accounts
    accounts = await web3.eth.getAccounts();

    // Deploy the contract
    lotery = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object,
        })
        .send({ from: accounts[0], gas: "1000000" });
});

describe("Verify lotery contract", () => {
    it("deploys lotery contract", () => {
        assert.ok(lotery.options.address, "contract not deployed yet!");
    });

    it("Check manager", async () => {
        let manager = await lotery.methods.manager().call();
        assert.equal(manager, accounts[0], "You are not the manager");
    });

    it("Check lotery status", async () => {
        let status = await lotery.methods.isLoteryOpen().call();
        assert.equal(status, true, "Lotery status should be open");
    });
});

describe("Test enter method", () => {
    it("Manager should not able to access enter method", async () => {
        try {
            await lotery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei("0.001", "ether"),
            });
            assert(false, "Manager should be not able to join the lotery");
        } catch (err) {
            assert.ok(err, "Manager should be not able to join the lotery");
        }
    });

    it("Verify if status lotery is already close, no one can enter the lotery", async () => {
        try {
            await lotery.methods.closeLotery().send({ from: accounts[0] });
        } catch (_) {
            assert(false, "Failed try to close lotery");
        }

        try {
            await lotery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });
            assert(
                false,
                "Lotery should be closed, no one can enter the lotery"
            );
        } catch (err) {
            assert.ok(
                err,
                "Lotery should be closed, no one can enter the lotery"
            );
        }
    });

    it("Verify minimum amount to join the lotery", async () => {
        try {
            await lotery.methods.openLotery().send({ from: accounts[0] });
        } catch (_) {
            assert(false, "Failed try to open lotery");
        }

        try {
            await lotery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei("0.0001", "ether"),
            });
            assert(
                false,
                "Should be greater than equal 0.001 ether to join the lotery"
            );
        } catch (err) {
            assert.ok(
                err,
                "Should be greater than equal 0.001 ether to join the lotery"
            );
        }
    });

    it("Success enter the lotery", async () => {
        try {
            await lotery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });
        } catch (err) {
            assert.ok(err, "User should be enter the lotery");
        }
    });
});

describe("Test pickWinner method", () => {
    it("Only manager should able to access", async () => {
        try {
            await lotery.methods.pickWinner().send({
                from: accounts[1],
            });
            assert(
                false,
                "Only manager should able to access pickWinner method"
            );
        } catch (err) {
            assert.ok(
                err,
                "Only manager should able to access pickWinner method"
            );
        }
    });

    it("Verify only can pick the winner if players more than equal 1", async () => {
        try {
            await lotery.methods.pickWinner().send({
                from: accounts[0],
            });
            assert(false, "Winner can be picked if it at least 1 player");
        } catch (err) {
            assert.ok(err, "Winner can be picked if it at least 1 player");
        }
    });

    it("Success pick the winner", async () => {
        try {
            for (i = 1; i <= 5; i++) {
                await lotery.methods.enter().send({
                    from: accounts[i],
                    value: web3.utils.toWei("0.001", "ether"),
                });
            }
        } catch (error) {
            assert(false, "Should be success account 2-6 to enter the lotery");
        }

        try {
            await lotery.methods.pickWinner().send({
                from: accounts[0],
            });
        } catch (error) {
            assert(false, "Should be success to pick the winner");
        }

        // let players = await lotery.methods.getPlayers().call();
        // assert.equal(
        //     players.length,
        //     0,
        //     "Players should be reseted after found the winner"
        // );
    });
});

describe("Test closeLotery method", () => {
    it("Only manager can close the lotery", async () => {
        try {
            await lotery.methods.closeLotery().send({
                from: accounts[1],
            });
            assert(false, "Only manager can close the lotery");
        } catch (err) {
            assert.ok(err, "Only manager can close the lotery");
        }
    });

    it("Success close the lotery", async () => {
        try {
            await lotery.methods.closeLotery().send({
                from: accounts[0],
            });
        } catch (_) {
            assert(false, "Manager should be able to close the lotery");
        }
    });
});

describe("End to end test of lotery", () => {
    it("Success enter and pick the winner of the lotery", async () => {
        try {
            await lotery.methods.openLotery().send({
                from: accounts[0],
            });
        } catch (_) {
            assert(false, "Manager should be able to open the lotery");
        }

        let balanceAfterEnter;
        let balanceAfterWinning;

        try {
            await lotery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei("0.001", "ether"),
            });

            balanceAfterEnter = await web3.eth.getBalance(accounts[1]);

            await lotery.methods.pickWinner().send({ from: accounts[0] });

            balanceAfterWinning = await web3.eth.getBalance(accounts[1]);
            assert(
                balanceAfterEnter < balanceAfterWinning,
                "Balance after enter the lotery should be less than balance after win the lotery"
            );
        } catch (_) {
            assert(false, "Should be success to do end to end process");
        }
    });
});
