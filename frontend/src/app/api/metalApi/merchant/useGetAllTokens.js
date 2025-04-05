import dotenv from 'dotenv';

/**
 * Create liquidity for your token by adding it to a liquidity pool.
 *
 * @param {string} jobId - Job ID of the token creation.
 * 
 * @returns {json} - status of the token creation
 */
export default async function getAllTokens(){
    const response = await fetch(
        'https://api.metal.build/merchant/all-tokens',
        {
          headers: {
            'x-api-key': process.env.METAL_SECRET_API_KEY
          },
      })

      /*
        {
            [
                {
                id: "0x1234567890abcdef1234567890abcdef12345678",
                address: "0x1234567890abcdef1234567890abcdef12345678",
                name: "Test Token",
                symbol: "TEST",
                totalSupply: 1000000000,
                startingAppSupply: 100000000,
                remainingAppSupply: 99999000,
                merchantSupply: 100000000,
                merchantAddress: "0x1234567890abcdef1234567890abcdef12345678",
                price: 0.015,
                },
                {
                id: "0x9876543210fedcba9876543210fedcba98765432",
                address: "0x9876543210fedcba9876543210fedcba98765432",
                name: "Test Token 2",
                symbol: "TEST2",
                totalSupply: 1000000000,
                startingAppSupply: 200000000,
                remainingAppSupply: 199999000,
                merchantSupply: 200000000,
                merchantAddress: "0x9876543210fedcba9876543210fedcba98765432",
                price: 0.025,
                }
            ],
        }

      */
      
      const tokens = await response.json()
      
      return tokens
}