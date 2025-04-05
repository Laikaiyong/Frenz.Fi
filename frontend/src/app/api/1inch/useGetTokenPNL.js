import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the current value of a protocol from the 1inch API.
 *@param {array[string]} tokenAddress - An array of protocol addresses to fetch data for.
 * @param {string} timeRange - The time range for the profit and loss calculation ("1day", "1week","1month","1year","3years").
 * @param {number} chainId - The ID of the blockchain network.
 * @param {boolean} useCache - Whether to use cached data or not.
 * @returns {Promise<Object>} A promise that resolves to the response object containing the protocols' current values.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function getTokenPNL(tokenAddress, timeRange, chainId, useCache) {

    try {
        const response = await fetch("https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/profit_and_loss", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`
            },
            body: JSON.stringify({
                addresses: tokenAddress,
                chain_id: chainId,
                timerange: timeRange,
                use_cache: useCache
                
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