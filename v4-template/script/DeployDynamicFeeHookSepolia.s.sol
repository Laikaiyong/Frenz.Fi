// script/DeployDynamicFeeHookSepolia.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";
import {DynamicFeeHook} from "../src/DynamicFeeHook.sol";

contract DeployDynamicFeeHookSepolia is Script {
    // The CREATE2 deployer address should be the same across chains
    address constant CREATE2_DEPLOYER = address(0x4e59b44847b379578588920cA78FbF26c0B4956C);
    
    // Sepolia PoolManager address
    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Using PoolManager at:", POOL_MANAGER);
        IPoolManager poolManager = IPoolManager(POOL_MANAGER);
        
        vm.startBroadcast(deployerPrivateKey);
        
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
        require(address(dynamicFeeHook) == hookAddress, "Hook address mismatch");

        console.log("DynamicFeeHook deployed to Sepolia at:", address(dynamicFeeHook));
        
        vm.stopBroadcast();
    }
}