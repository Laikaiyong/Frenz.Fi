import dotenv from 'dotenv';
/**
 * Create liquidity for your token by adding it to a liquidity pool.
 *
 * @param {string} tokenAddress - The token address to be distributed to users
 * @param {string} receiverAddress - The wallet address of the receiver of the token
 * @param {string} amount - the amount the receiver will be getting
 * 
 * @returns {status} - status of the action performed
 */
export default async function distributeTokenToAddress(tokenAddress, receiverAddress, amount){
    const response = await fetch(
        `https://api.metal.build/token/${tokenAddress}/distribute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.METAL_SECRET_API,
          },
          body: JSON.stringify({
            sendTo: `${receiverAddress}`,
            amount: `${amount}`
          }),
        }
      )
      
      const distributeStatus = await response.json()

      /*
      { "success": true }
      */
      
      return distributeStatus.success
}