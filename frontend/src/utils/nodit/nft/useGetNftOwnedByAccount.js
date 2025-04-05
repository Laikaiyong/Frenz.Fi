import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the current value of a protocol from the 1inch API.
 * @param {string/address} accountAddress - address of the account to search
 * @param {Array<string/address>} accountAddress - NFT transfers by account address.
 * @param {boolean} withCount - Whether to include the count of transfers.
 * @param {boolean} withMetadata - Whether to include metadata of the NFT.
 * 
 * both page and rpp needs to be used together, if you want to use pagination.
 * @param {number} page - number of pages to retrieve
 * @param {number} rpp - number of results per page
 * 
 * if pagination is used, then cursor cannot be used
 * @param {string} cursor - cursor for pagination
 * 
 * @returns {Promise<Object>} A promise that resolves to the response object containing the protocols' current values.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function useGetNftOwnedByAccount(accountAddress, contractAddress = null, page = null, rpp = null, cursor = null, withCount = false, withMetadata = false) {

    try {
        const body = {
            accountAddress: accountAddress,
            withCount: withCount,
            withMetadata: withMetadata,
        };

        if (contractAddress !== null) body.contractAddress = contractAddress;
        if (page !== null) body.page = page;
        if (rpp !== null) body.rpp = rpp;
        if (cursor !== null) body.cursor = cursor;

        const response = await fetch("https://web3.nodit.io/v1/base/mainnet/nft/getNftsOwnedByAccount", {
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
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        throw error; 
    }
} 