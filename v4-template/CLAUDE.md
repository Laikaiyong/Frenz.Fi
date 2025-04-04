# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test Commands
- `forge install`: Install dependencies
- `forge build`: Build the project
- `forge test`: Run all tests
- `forge test -vv`: Run tests with medium verbosity
- `forge test --match-test testFunctionName -vvv`: Run a specific test with high verbosity
- `anvil`: Start local Ethereum node
- `forge script script/Anvil.s.sol --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast`: Deploy contracts to local node

## Code Style Guidelines
- Use SPDX-License-Identifier at the top of each file
- Use Solidity pragma 0.8.24 or higher
- Organize imports logically - core libraries first, then periphery
- Follow Solidity style guide with descriptive function/variable names
- Use natspec comments for all public functions and contracts
- Include error handling with descriptive error messages
- Follow naming conventions: contracts PascalCase, functions/variables camelCase
- Separate hook implementations with appropriate comments
- Test all hook functionality thoroughly
- When implementing Uniswap v4 hooks, inherit from BaseHook and implement required lifecycle methods