// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {PositionManager} from "v4-periphery/src/PositionManager.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IPositionDescriptor} from "v4-periphery/src/interfaces/IPositionDescriptor.sol";
import {IWETH9} from "v4-periphery/src/interfaces/external/IWETH9.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

contract DeployPositionManager is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get PoolManager address from environment
        address poolManagerAddress = vm.envAddress("POOL_MANAGER_ADDRESS");
        console.log("Using PoolManager at:", poolManagerAddress);
        
        // For Celo, we're using the canonical Permit2 address
        address permit2Address = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
        console.log("Using Permit2 at:", permit2Address);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy PositionManager
        PositionManager posm = new PositionManager(
            IPoolManager(poolManagerAddress),
            IAllowanceTransfer(permit2Address),
            300_000,
            IPositionDescriptor(address(0)),
            IWETH9(address(0))
        );
        console.log("PositionManager deployed at:", address(posm));
        
        vm.stopBroadcast();
    }
}