import dotenv from 'dotenv';

/**
 * Create liquidity for your token by adding it to a liquidity pool.
 *
 * @param {string} holderWalletAddress - the address of the holder to be checked
 * @param {string} tokenAddress - the address of the token to be checked
 * 
 * @returns {json} - status of the token creation
 */
export default async function useGetSingleTokenInformationOfWallet(holderWalletAddress, tokenAddress){
  const response = await fetch(
    `https://api.metal.build/holder/${holderWalletAddress}/token/${tokenAddress}`,
    {
      headers: {
        'x-api-key': process.env.METAL_SECRET_API,
      },
    }
  )

  /*
  {
    name: "TestToken",
    symbol: "TT",
    id: "0xde522f429bde9776417985c6ebcdc9de872fd5c4",
    address: "0xde522f429bde9776417985c6ebcdc9de872fd5c4",
    balance: 2000000,
    value: 15.00
  }
 */ 
  const tokenInformation = await response.json()

  return tokenInformation
}