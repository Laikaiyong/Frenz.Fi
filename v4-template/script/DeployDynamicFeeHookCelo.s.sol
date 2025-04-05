// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";

import {DynamicFeeHook} from "../src/DynamicFeeHook.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";

contract DeployDynamicFeeHookCelo is Script {
    address constant CREATE2_DEPLOYER = address(0x4e59b44847b379578588920cA78FbF26c0B4956C);
    
    // Use the PoolManager address from the previous deployment
    address constant POOL_MANAGER = 0xAF85A0023fAc623fCE4F20f50BD475C01e6791B1;
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Hook permissions
        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.AFTER_INITIALIZE_FLAG | 
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG
        );

        // Mine a salt for the hook address
        bytes memory constructorArgs = abi.encode(POOL_MANAGER);
        (address hookAddress, bytes32 salt) =
            HookMiner.find(CREATE2_DEPLOYER, flags, type(DynamicFeeHook).creationCode, constructorArgs);

        // Deploy the hook using CREATE2
        DynamicFeeHook dynamicFeeHook = new DynamicFeeHook{salt: salt}(IPoolManager(POOL_MANAGER));
        require(address(dynamicFeeHook) == hookAddress, "Hook address mismatch");

        console.log("DynamicFeeHook deployed at:", address(dynamicFeeHook));
        
        vm.stopBroadcast();
    }
}