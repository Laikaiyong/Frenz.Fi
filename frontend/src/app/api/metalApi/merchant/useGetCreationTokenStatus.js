import dotenv from 'dotenv';

/**
 * Create liquidity for your token by adding it to a liquidity pool.
 *
 * @param {string} jobId - Job ID of the token creation.
 * 
 * @returns {json} - status of the token creation
 */
export default async function getCreationTokenStatus(jobId){
    const statusUrl = `https://api.metal.build/merchant/create-token/status/${jobId}`;

    const response = await fetch(statusUrl, {
    headers: { 'x-api-key': process.env.METAL_SECRET_API_KEY },
    });

    const statusResponse = await response.json();

/*
    @pending
    {
        jobId: "e20b21ec-10ca-5756-938c-855e78add351",
        status: "pending",
        data: {}
    }
    
    @success
    {
        jobId: "e20b21ec-10ca-5756-938c-855e78add351",
        status: "success",
        data: {
        id: "0x1234567890abcdef1234567890abcdef12345678",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        name: "Test Token",
        symbol: "TEST",
        totalSupply: 1000000000,
        startingAppSupply: 100000000,
        remainingAppSupply: 100000000,
        merchantSupply: 50000000,
        merchantAddress: "0x1234567890abcdef1234567890abcdef12345678",
        price: null,
        }
    }
    */
    return statusResponse;
}