import dotenv from 'dotenv';

/**
 * Create liquidity for your token by adding it to a liquidity pool.
 *
 * @param {string/address} tokenAddress - The token address to adding into liquidity pool
 * 
 * @returns {status} - status of the action performed
 */
export default async function useCreateTokenLiquidity(tokenAddress){
    const response = await fetch(
        `https://api.metal.build/token/${tokenAddress}/liquidity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.METAL_SECRET_API_KEY,
          }
        }
      )
      
      const responseStatus = await response.json()
      
      /*
      { "success": true }
      */
      
      return responseStatus.success
}