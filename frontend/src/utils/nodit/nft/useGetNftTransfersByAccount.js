import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches NFT transfers for a given account address.
 * 
 * @param {string} accountAddress - The account address to fetch NFT transfers for.
 * @param {string|null} relation - The relation type (e.g., "from", "to", or "both"). Defaults to null.
 * @param {string|null} contractAddress - The specific NFT contract address to filter by. Defaults to null.
 * @param {number|null} fromBlock - The starting block number for the query. Defaults to null.
 * @param {number|null} toBlock - The ending block number for the query. Defaults to null.
 * @param {string|null} fromDate - The start date for the transfers in ISO 8601 format (e.g., "2025-01-01T00:00:00+00:00"). Defaults to null.
 * @param {string|null} toDate - The end date for the transfers in ISO 8601 format (e.g., "2025-01-01T00:00:00+00:00"). Defaults to null.
 * @param {number|null} page - The page number for paginated results. Defaults to null.
 * @param {number|null} rpp - The number of results per page. Defaults to null.
 * @param {string|null} cursor - The cursor for fetching the next set of results. Defaults to null.
 * @param {boolean} withCount - Whether to include the total count of transfers in the response. Defaults to null.
 * @param {boolean} withMetadata - Whether to include metadata for the transfers. Defaults to null.
 * @param {boolean} withZeroValue - Whether to include transfers with zero value. Defaults to null.
 * 
 * @returns {Promise<Object>} A promise that resolves to the response object containing the NFT transfers.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function getNftTransfersByAccount(accountAddress, relation = null, contractAddress = null, fromBlock = null, toBlock = null, fromDate = null, toDate = null, page = null, rpp = null, cursor = null, withCount = false, withMetadata = false, withZeroValue = false) {

    const body = {
        accountAddress: accountAddress,
        withCount: withCount,
        withMetadata: withMetadata,
        withZeroValue: withZeroValue
    };

    if (contractAddress !== null) body.contractAddress = contractAddress;
    if (relation !== null) body.relation = relation;
    if (fromBlock !== null) body.fromBlock = fromBlock;
    if (toBlock !== null) body.toBlock = toBlock;
    if (fromDate !== null) body.fromDate = fromDate;
    if (toDate !== null) body.toDate = toDate;
    if (page !== null) body.page = page;
    if (rpp !== null) body.rpp = rpp;
    if (cursor !== null) body.cursor = cursor;

    try {
        const response = await fetch("https://web3.nodit.io/v1/base/mainnet/nft/getNftTransfersByAccount", {
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