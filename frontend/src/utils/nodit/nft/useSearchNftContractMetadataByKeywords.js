import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the current value of a protocol from the 1inch API.
 * @param {string} keyword - The keyword to search for in the NFT contract metadata.
 * @param {boolean} withCount - Whether to include the count of transfers.
 * 
 * both page and rpp needs to be used together, if you want to use pagination.
 * @param {number} page - The address of the NFT contract.
 * @param {number} rpp - The address of the NFT contract.
 * 
 * if pagination is used, then cursor cannot be used
 * @param {string} cursor - The address of the NFT contract.
 * 
 * @returns {Promise<Object>} A promise that resolves to the response object containing the protocols' current values.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function searchNftContractMetadataByKeywords(keyword, page = null, rpp = null, cursor = null, withCount = false) {

    const body = {
        kayword: keyword,
        withCount: withCount
    };

    if (page !== null) body.page = page;
    if (rpp !== null) body.rpp = rpp;
    if (cursor !== null) body.cursor = cursor;

    try {
        const response = await fetch("https://web3.nodit.io/v1/base/mainnet/nft/searchNftContractMetadataByKeyword", {
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