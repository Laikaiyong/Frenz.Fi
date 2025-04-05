import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetches the supported chains from the 1inch API.
 * @returns {Promise<Object>} A promise that resolves to the response object containing the chains supported by 1inch.
 * @throws {Error} Throws an error if the HTTP request fails or the response is not ok.
 */
export default async function getSupportedChains() {

    try {
        const response = await fetch("https://api.1inch.dev/portfolio/portfolio/v4/general/supported_chains", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`
            },
            body: JSON.stringify({
                
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