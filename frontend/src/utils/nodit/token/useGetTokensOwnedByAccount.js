import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the current value of a protocol from the 1inch API.
 * @param {Array<string>} contractAddresses - An array of contract addresses to fetch the metadata of NFT contracts.
 * 
 * @returns {Promise<Object>} A promise that resolves to the response object containing the protocols' current values.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function useGetTokensOwnedByAccount(network, accountAddress, contractAddresses = null, page = null, rpp = null, cursor = null, withCount = false) {
    // Ensure dotenv is configured correctly

    const body = {
        accountAddress: accountAddress,
        withCount: withCount,
    };

    if (contractAddresses) body.contractAddresses = contractAddresses;
    if (page) body.page = page;
    if (rpp) body.rpp = rpp;
    if (cursor) body.cursor = cursor;

    try {
        const response = await fetch(`https://web3.nodit.io/v1/${network}/mainnet/token/getTokensOwnedByAccount`, {
            method: "POST",
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'X-API-KEY': process.env.NEXT_PUBLIC_NODIT_API_KEY,
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
        throw error; 
    }
} 