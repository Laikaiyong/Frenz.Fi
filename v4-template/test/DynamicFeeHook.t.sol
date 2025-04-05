// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {DynamicFeeHook} from "../src/DynamicFeeHook.sol";

contract BasicHookTest is Test {
    DynamicFeeHook hook;
    address mockPoolManager = address(0x1);
    
    function setUp() public {
        // Just directly deploy the hook without address mining
        hook = new DynamicFeeHook(IPoolManager(mockPoolManager));
    }
    
    function testConstants() public {
        // Verify constants are set correctly
        assertEq(hook.BASE_FEE(), 500);
        assertEq(hook.LOW_FEE(), 1000);
        assertEq(hook.MID_FEE(), 3000);
        assertEq(hook.HIGH_FEE(), 10000);
        assertEq(hook.EXTREME_FEE(), 30000);
        
        assertEq(hook.owner(), address(this));
    }
    
    function testEmergencyMode() public {
        // Test emergency mode functionality
        hook.setEmergencyMode(true, hook.HIGH_FEE());
        assertTrue(hook.emergencyModeActive());
        assertEq(hook.emergencyFee(), hook.HIGH_FEE());
        
        hook.setEmergencyMode(false, 0);
        assertFalse(hook.emergencyModeActive());
    }
    
    function testOwnership() public {
        address newOwner = makeAddr("newOwner");
        hook.transferOwnership(newOwner);
        assertEq(hook.owner(), newOwner);
        
        vm.expectRevert("Not authorized");
        hook.setEmergencyMode(true, 1000);
    }
}