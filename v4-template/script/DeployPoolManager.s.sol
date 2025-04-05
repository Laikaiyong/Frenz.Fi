// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {PoolManager} from "v4-core/src/PoolManager.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";

contract DeployPoolManager is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy PoolManager
        PoolManager poolManager = new PoolManager(address(0));
        console.log("PoolManager deployed at:", address(poolManager));
        
        vm.stopBroadcast();
    }
}