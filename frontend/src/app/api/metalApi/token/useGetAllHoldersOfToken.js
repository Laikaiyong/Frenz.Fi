import dotenv from 'dotenv';

/**
 * Fetches token information by its address.
 *
 * @param {string/address} tokenAddress - The token address to retrieve information for.
 * 
 * @returns {Array<json>} An array of different holders of the token
 */
export default async function useGetAllHoldersOfToken(tokenAddress) {
    const response = await fetch(`https://api.metal.build/token/${tokenAddress}`, {
        headers: {
            'x-api-key': process.env.METAL_SECRET_API,
        },
    });

    const allHolders = await response.json();

    /*
    [{
        id: "string",
        address: "string",
        balance: "number",
        value: "number",
    }]
    */
    return allHolders;
}