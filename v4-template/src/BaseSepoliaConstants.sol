// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PositionManager} from "v4-periphery/src/PositionManager.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/src/test/PoolModifyLiquidityTest.sol";

/// @notice Shared constants for Base Sepolia network
contract BaseSepoliaConstants {
    // CREATE2 deployer is the same on all chains
    address constant CREATE2_DEPLOYER = address(0x4e59b44847b379578588920cA78FbF26c0B4956C);

    // Base Sepolia official addresses
    IPoolManager constant POOLMANAGER = IPoolManager(address(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408));
    PositionManager constant posm = PositionManager(payable(address(0x4B2C77d209D3405F41a037Ec6c77F7F5b8e2ca80)));
    PoolSwapTest constant swapRouter = PoolSwapTest(address(0x8B5bcC363ddE2614281aD875bad385E0A785D3B9));
    PoolModifyLiquidityTest constant lpRouter = PoolModifyLiquidityTest(address(0x37429cD17Cb1454C34E7F50b09725202Fd533039));
    
    // Permit2 is typically at the same address across all chains
    IAllowanceTransfer constant PERMIT2 = IAllowanceTransfer(address(0x000000000022D473030F116dDEE9F6B43aC78BA3));
}