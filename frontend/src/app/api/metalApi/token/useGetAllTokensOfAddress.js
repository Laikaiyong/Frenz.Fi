import dotenv from 'dotenv';

/**
 * Fetches token information by its address.
 *
 * @param {string/address} tokenAddress - The token address to retrieve information for.
 * 
 * @returns {Array<Json>} A promise that resolves to the token information.
 */
export default async function useGetAllTokensOfAddress(tokenAddress) {
    const response = await fetch(`https://api.metal.build/token/${tokenAddress}`, {
        headers: {
            'x-api-key': process.env.METAL_SECRET_API,
        },
    });

    const allHoldersOfToken = await response.json();

    /*
    [{
        id: "string",
        address: "string",
        balance: "number",
        value: "number",
    }]
    */
    return allHoldersOfToken;
}