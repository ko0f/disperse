// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

contract Disperse {
    address private owner;
    mapping(address => bool) private whitelist;

    constructor() {
        owner = msg.sender;
        whitelist[owner] = true;
    }

    modifier onlyowner() {
        require(msg.sender == owner, "A");
        _;
    }

    modifier restricted() {
        require(whitelist[msg.sender], "B");
        _;
    }

    function addUser(address user) external onlyowner {
        whitelist[user] = true;
    }

    function removeUser(address user) external onlyowner {
        require(user != owner, "C");
        whitelist[user] = false;
    }

    function disperseEther(address[] memory recipients, uint256[] memory values)
        external
        payable
        restricted
    {
        for (uint256 i = 0; i < recipients.length; i++)
            payable(recipients[i]).transfer(values[i]);

        uint256 balance = address(this).balance;

        if (balance > 0) 
            payable(msg.sender).transfer(balance);
    }

    function disperseToken(
        IERC20 token,
        address[] memory recipients,
        uint256[] memory values
    ) external restricted {
        uint256 total = 0;
        uint256 i;

        for (i = 0; i < recipients.length; i++) 
          total += values[i];

        require(token.transferFrom(msg.sender, address(this), total));

        for (i = 0; i < recipients.length; i++)
            require(token.transfer(recipients[i], values[i]));
    }

    function disperseTokenSimple(
        IERC20 token,
        address[] memory recipients,
        uint256[] memory values
    ) external restricted {
        for (uint256 i = 0; i < recipients.length; i++)
            require(token.transferFrom(msg.sender, recipients[i], values[i]));
    }

    function empty() pure internal {
        require(false, "Z");
    }
}
