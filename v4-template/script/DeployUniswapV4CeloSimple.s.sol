// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {PoolManager} from "v4-core/src/PoolManager.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/src/test/PoolModifyLiquidityTest.sol";
import {PoolDonateTest} from "v4-core/src/test/PoolDonateTest.sol";

contract DeployUniswapV4CeloSimple is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy PoolManager
        PoolManager poolManager = new PoolManager(address(0));
        console.log("PoolManager deployed at:", address(poolManager));
        
        // 2. Deploy test routers
        PoolModifyLiquidityTest lpRouter = new PoolModifyLiquidityTest(poolManager);
        console.log("PoolModifyLiquidityTest deployed at:", address(lpRouter));
        
        PoolSwapTest swapRouter = new PoolSwapTest(poolManager);
        console.log("PoolSwapTest deployed at:", address(swapRouter));
        
        PoolDonateTest donateRouter = new PoolDonateTest(poolManager);
        console.log("PoolDonateTest deployed at:", address(donateRouter));
        
        vm.stopBroadcast();
    }
}