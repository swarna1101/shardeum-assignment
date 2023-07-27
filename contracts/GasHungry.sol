// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract GasHungry {
    uint256[100000] public gasEater;

    constructor() {
        for (uint256 i = 0; i < 1000; i++) {
            gasEater[i] = i;
        }
    }
}