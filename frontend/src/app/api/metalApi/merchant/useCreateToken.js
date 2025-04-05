import dotenv from 'dotenv';

/**
 * Create liquidity for your token by adding it to a liquidity pool.
 *
 * @param {string} tokenName - The name for your token
 * @param {string} tokenSymbol - The ticker symbol for your token
 * @param {boolean} canDistribute - Enable distribution functionality for this token
 * @param {boolean} canLP - Enable liquidity pool creation for this token
 * @param {string/address} merchantAddress - The address to receive the merchant token allocation. If a merchant address is provided, the merchant allocation will be fixed at 5% of the total supply
 * 
 * @returns {string} - the id of the creation of token
 */
export default async function useCreateToken(tokenName, tokenSymbol, canDistribute, canLP, merchantAddress){
    const response = await fetch('https://api.metal.build/merchant/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.METAL_SECRET_API_KEY,
        },
        body: JSON.stringify({
          name: `${tokenName}`,
          symbol: `${tokenSymbol}`,
          merchantAddress: `${canDistribute}`,
          canDistribute: `${canLP}`,
          canLP: `${merchantAddress}`
        }),
      })

      /*
      { jobId: "48384e4e-0da0-5932-8fd7-b95e84b45530" }
      */
      const token = await response.json()
      
      return token.jobId
}