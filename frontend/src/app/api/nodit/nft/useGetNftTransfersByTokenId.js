import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the current value of a protocol from the 1inch API.
 * @param {Array<string>} accountAddress - NFT transfers by account address.
 * @param {string} tokenId - The token ID of the NFT.
 * @param {string} fromDate - The start date for the transfers. (eg: 2025-01-01T00:00:00+00:00)
 * @param {string} toDate - The end date for the transfers. (eg: 2025-01-01T00:00:00+00:00)
 * @param {boolean} withCount - Whether to include the count of transfers.
 * @param {boolean} withMetadata - Whether to include metadata for the transfers.
 * @param {boolean} withZeroValue - Whether to include zero-value transfers.
 * @param {hexadecimal} fromBlock - The address of the NFT contract.
 * @param {hexadecimal} toBlock - The address of the NFT contract.
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
export default async function useGetNftTransfersByTokenId(contractAddress, tokenId, fromBlock = null, toBlock = null, fromDate = null, toDate = null, page = null, rpp = null, cursor = null, withCount = false, withMetadata = false, withZeroValue = false) {

    const body = {
        contractAddress: contractAddress,
        tokenId: tokenId,
        withCount: withCount,
        withMetadata: withMetadata,
        withZeroValue: withZeroValue
    };
    
    if (fromBlock !== null) body.fromBlock = fromBlock;
    if (toBlock !== null) body.toBlock = toBlock;
    if (fromDate !== null) body.fromDate = fromDate;
    if (toDate !== null) body.toDate = toDate;
    if (page !== null) body.page = page;
    if (rpp !== null) body.rpp = rpp;
    if (cursor !== null) body.cursor = cursor;

    try {
        const response = await fetch("https://web3.nodit.io/v1/base/mainnet/nft/getNftTransfersByTokenId", {
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