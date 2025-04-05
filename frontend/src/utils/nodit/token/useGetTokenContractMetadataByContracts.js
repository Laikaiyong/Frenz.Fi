/**
 * Fetches the current value of a protocol from the 1inch API.
 * @param {Array<string>} contractAddresses - An array of contract addresses to fetch the metadata of NFT contracts.
 * 
 * @returns {Promise<Object>} A promise that resolves to the response object containing the protocols' current values.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function getNftContractMetadataByContracts(network, contractAddresses) {
    // Ensure dotenv is configured correctly

    try {
        const response = await fetch(`https://web3.nodit.io/v1/${network}/mainnet/token/getTokenContractMetadataByContract`, {
            method: "POST",
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'X-API-KEY': process.env.NEXT_PUBLIC_NODIT_API_KEY,
            },
            body: JSON.stringify({
                contractAddresses: [contractAddresses]
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