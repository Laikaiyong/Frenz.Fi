// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";

import {DynamicFeeHook} from "../src/DynamicFeeHook.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";

contract BaseMainnetDeployment is Script {
    // Base Mainnet official addresses (VERIFY THESE!)
    address constant POOL_MANAGER = 0x498581fF718922c3f8e6A244956aF099B2652b2b; 
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C; 

    function run() public {
        // Get the deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Hook contracts must have specific flags encoded in the address
        uint160 flags = uint160(
            Hooks.BEFORE_INITIALIZE_FLAG | Hooks.AFTER_INITIALIZE_FLAG | 
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG
        );

        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(POOL_MANAGER);
        (address hookAddress, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER, 
            flags, 
            type(DynamicFeeHook).creationCode, 
            constructorArgs
        );

        // Deploy the hook using CREATE2
        DynamicFeeHook dynamicFeeHook = new DynamicFeeHook{salt: salt}(IPoolManager(POOL_MANAGER));
        
        // Verify hook address matches
        require(address(dynamicFeeHook) == hookAddress, "Hook address mismatch");

        console.log("DynamicFeeHook deployed to Base Mainnet at:", address(dynamicFeeHook));

        vm.stopBroadcast();
    }
}