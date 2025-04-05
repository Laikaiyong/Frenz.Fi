import dotenv from 'dotenv';

/**
 * Fetches token information by its address.
 *
 * @param {string} userId - any unique id for the user
 * 
 * @returns {json} - A json that contains the status of the creation
 */
export default async function useCreateNewHolder(userId) {
    const response = await fetch(`https://api.metal.build/holder/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key':  process.env.METAL_SECRET_API,
          },
        })
        
    const holder = await response.json()        

    /*
    {
        "success": true,
        "id": "1234567890",
        "address": "0x38A7ff01f9A2318feA8AafBa379a6c2c18b5d1dc",
        "totalValue": 0,
        "tokens": []
    }
    */
    return holder;
}