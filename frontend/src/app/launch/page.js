// - Token Ticker
// - Token Image
// - Token Name
// - Branding Kit
// - Description
// - Social Links

"use client";
import { useState } from "react";

export default function LaunchForm() {
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    image: null,
    brandingKit: null,
    description: "",
    socials: {
      twitter: "",
      telegram: "",
      discord: "",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  const [imagePreview, setImagePreview] = useState(null);
  const [brandingFiles, setBrandingFiles] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBrandingKitChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, brandingKit: file });
      setBrandingFiles([file]); // Show file name in preview
    }
  };
  
  return (
    <div className="mt-20">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6">
          Launch Your Token
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Token Ticker
            </label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) =>
                setFormData({ ...formData, ticker: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Token Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
              rows="4"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Token Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                className="hidden"
                id="token-image"
              />
              <label
                htmlFor="token-image"
                className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-[#00f0ff] transition-all duration-200 bg-white/50 backdrop-blur-sm">
                Choose File
              </label>
              {imagePreview && (
                <div className="relative w-16 h-16">
                  <img
                    src={imagePreview}
                    alt="Token preview"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Branding Kit (ZIP)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".zip"
                onChange={handleBrandingKitChange}
                className="hidden"
                id="branding-kit"
              />
              <label
                htmlFor="branding-kit"
                className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-[#00f0ff] transition-all duration-200 bg-white/50 backdrop-blur-sm">
                Choose File
              </label>
              {brandingFiles.length > 0 && (
                <div className="text-sm text-gray-600">
                  {brandingFiles[0].name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
              Social Links
            </label>
            {["twitter", "telegram", "discord"].map((social) => (
              <input
                key={social}
                type="url"
                placeholder={`${
                  social.charAt(0).toUpperCase() + social.slice(1)
                } URL`}
                value={formData.socials[social]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, [social]: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white py-3 px-4 rounded-md hover:opacity-90 transition-all duration-200 font-medium mt-6 focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:ring-offset-2 transform hover:scale-[1.02]">
          Launch Token
        </button>
      </form>
    </div>
  );
}
