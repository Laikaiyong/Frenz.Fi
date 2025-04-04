// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "v4-core/src/PoolManager.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";

import {DynamicFeeHook} from "../src/DynamicFeeHook.sol";

contract BaseSepolia is Script {
    // Base Sepolia CREATE2 deployer (confirm this address)
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() public {
        // Get the deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Pool Manager (or use existing address if available)
        IPoolManager poolManager = deployPoolManager();

        // Hook flags configuration
        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.AFTER_INITIALIZE_FLAG | 
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG
        );

        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(poolManager);
        (address hookAddress, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER, 
            flags, 
            type(DynamicFeeHook).creationCode, 
            constructorArgs
        );

        // Deploy the hook using CREATE2
        DynamicFeeHook dynamicFeeHook = new DynamicFeeHook{salt: salt}(poolManager);
        
        // Verify hook address matches
        require(address(dynamicFeeHook) == hookAddress, "Hook address mismatch");

        console.log("DynamicFeeHook deployed at:", address(dynamicFeeHook));

        vm.stopBroadcast();
    }

    function deployPoolManager() internal returns (IPoolManager) {
        // If Base Sepolia has a pre-deployed Pool Manager, replace with its address
        // Otherwise, deploy a new Pool Manager
        return IPoolManager(address(new PoolManager(address(0))));
    }
}