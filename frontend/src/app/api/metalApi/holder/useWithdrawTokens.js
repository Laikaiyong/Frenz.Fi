import dotenv from 'dotenv';

/**
 * Fetches token information by its address.
 *
 * @param {string/address} tokenAddress - The address of the token to withdraw.
 * @param {string/address} amount - The amount of tokens to withdraw.
 * @param {string/address} receiverAddress - The address to send the tokens to.
 * 
 * @returns {boolean} the status of the withdrawal of token
 */
export default async function useWithdrawTokens(tokenAddress, amount, receiverAddress) {
    const response = await fetch(
        `https://api.metal.build/holder/${userId}/withdraw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.METAL_SECRET_API,
          },
          body: JSON.stringify({
              tokenAddress: `${tokenAddress}`,
              amount: `${amount}`,
              toAddress: `${receiverAddress}`
            }),
        }
      )
      
      const withdrawStatus = await response.json()
           

    /*
    { "success": true }
    */
    return withdrawStatus;
}