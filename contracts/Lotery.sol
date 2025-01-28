// SPDX-License-Identifier: MIT
 
pragma solidity 0.8.19;
 
contract Lotery {
    address public manager;
    address[] private players;
    bool public isLoteryOpen = true;
    address public winner;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(isLoteryOpen, "Lotery already closed, please comeback after the winner got picked");
        require(msg.sender != manager, "Manager not allowed to join the lotery");
        require(msg.value >= .001 ether, "You need to spend at least .001 ether");

        players.push(msg.sender);
    }

    function closeLotery() public restricted {
        isLoteryOpen = false;
    }

    function openLotery() public restricted {
        isLoteryOpen = true;
        winner = address(0);
        delete players;
    }

    function pickWinner() public restricted {
        require(players.length > 0, "No participant on this lotery");

        uint256 winnerIndex = random() % players.length;
        winner = players[winnerIndex];
        payable(winner).transfer(address(this).balance);
        closeLotery();
    }

    // Helper function: Pseudo random number generator
    function random() private view returns (uint256) {
        bytes32 seed = blockhash(block.number - 1);
        bytes memory playersBytes = abi.encodePacked(players);
        return uint256(keccak256(abi.encode(seed, block.timestamp, playersBytes)));
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    modifier restricted() {
        require(msg.sender == manager, "Restriced, manager access only");
        _;
    }
}