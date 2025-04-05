import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the current value of a protocol from the 1inch API.
 * @param {Array[string]} addresses - diffferent tokens addresses to get the details of.
 * @param {string} chainId - The chain ID for the protocol.
 * @param {string} timeRange - The time range for the profit and loss calculation ("1day", "1week","1month","1year","3years").
 * @param {boolean} closed - Whether to include closed protocols.
 * @param {number} closedThreshold - The threshold for closed protocols.
 * @param {boolean} useCache - Whether to use cached data.
 * @returns {Promise<Object>} A promise that resolves to the response object containing the protocols' current values.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function getTokenDetails(addresses, chainId, timerange, closed, closedThreshold, useCache) {

    try {
        const response = await fetch("", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`
            },
            body: JSON.stringify({
                addresses: addresses,
                chain_id: chainId,
                timerange: timerange,
                closed: closed,
                closed_threshold: closedThreshold,
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