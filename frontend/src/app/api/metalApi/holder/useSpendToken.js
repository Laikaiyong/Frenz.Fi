import dotenv from 'dotenv';

/**
 * Fetches token information by its address.
 *
 * @param {string/address} userId - the id of the user to spend
 * @param {string/address} tokenAddress - The amount of tokens to withdraw.
 * @param {string/address} amount - TThe address to send the tokens to.
 * 
 * @returns {boolean} the status of the wwithdrawalof token
 */
export default async function spendToken(userId, tokenAddress, amount){
    const response = await fetch(
        `https://api.metal.build/holder/${userId}/spend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.METAL_SECRET_API,
          },
          body: JSON.stringify({
            tokenAddress: `${tokenAddress}`,
            amount: `${amount}`,
          }),
        }
      )      
      
      /*
      { "success": true }
      */
      const spendStatus = await response.json()
      
      return spendStatus
}