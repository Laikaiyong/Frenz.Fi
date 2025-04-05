import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the current value of a protocol from the 1inch API.
 * @param {string} contractAddress1 - The address of the first NFT contract.
 * @param {string} tokenId1 - The token ID of the first NFT.
 * @param {string} contractAddress2 - The address of the second NFT contract.
 * @param {string} tokenId2 - The token ID of the second NFT.
 * 
 * @returns {Promise<Object>} A promise that resolves to the response object containing the protocols' current values.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function syncNftMetadata(contractAddress1, tokenId1, contractAddress2, tokenId2) {

    try {
        const response = await fetch("https://web3.nodit.io/v1/base/mainnet/nft/getNftTransfersWithinRange", {
            method: "POST",
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'X-API-KEY': process.env.NEXT_PUBLIC_NODIT_API_KEY,
            },
            body: JSON.stringify({
                token:[
                    {
                        contractAddress: contractAddress1,
                        tokenId: tokenId1
                    },
                    {
                        contractAddress: contractAddress2,
                        tokenId: tokenId2
                    }
                ]
            })
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