// - Token Ticker
// - Token Image
// - Token Name
// - Branding Kit
// - Description
// - Social Links

"use client";
import { useState } from 'react';

export default function LaunchForm() {
    const [formData, setFormData] = useState({
        ticker: '',
        name: '',
        image: null,
        brandingKit: null,
        description: '',
        socials: {
            twitter: '',
            telegram: '',
            discord: ''
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Handle form submission logic here
    }

    return (
        <div className="mt-20">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Launch Your Token</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Token Ticker</label>
                        <input
                            type="text"
                            value={formData.ticker}
                            onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Token Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            rows="4"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Token Image</label>
                        <input
                            type="file"
                            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Branding Kit (ZIP)</label>
                        <input
                            type="file"
                            accept=".zip"
                            onChange={(e) => setFormData({...formData, brandingKit: e.target.files[0]})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 block">Social Links</label>
                        <input
                            type="url"
                            placeholder="Twitter URL"
                            value={formData.socials.twitter}
                            onChange={(e) => setFormData({
                                ...formData,
                                socials: {...formData.socials, twitter: e.target.value}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                        <input
                            type="url"
                            placeholder="Telegram URL"
                            value={formData.socials.telegram}
                            onChange={(e) => setFormData({
                                ...formData,
                                socials: {...formData.socials, telegram: e.target.value}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                        <input
                            type="url"
                            placeholder="Discord URL"
                            value={formData.socials.discord}
                            onChange={(e) => setFormData({
                                ...formData,
                                socials: {...formData.socials, discord: e.target.value}
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium mt-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Launch Token
                </button>
            </form>
        </div>
    )
}
