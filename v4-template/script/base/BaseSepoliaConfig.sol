// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Currency} from "v4-core/src/types/Currency.sol";

/// @notice Shared configuration for Base Sepolia
contract BaseSepoliaConfig {
    // Common tokens on Base Sepolia
    // WETH on Base Sepolia
    IERC20 constant token0 = IERC20(address(0x4200000000000000000000000000000000000006));
    
    // cbUSDC on Base Sepolia - you may need to adjust this
    // or deploy your own mock tokens if needed
    IERC20 constant token1 = IERC20(address(0x036CbD53842c5426634e7929541eC2318f3dCF7e));
    
    // This will be populated after hook deployment
    IHooks public hookContract;

    Currency constant currency0 = Currency.wrap(address(token0));
    Currency constant currency1 = Currency.wrap(address(token1));
    
    // Constructor to allow setting the hook address
    constructor(address _hookAddress) {
        if (_hookAddress != address(0)) {
            hookContract = IHooks(_hookAddress);
        }
    }
}