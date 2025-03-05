import React, { useState } from 'react';

interface AddressInputProps {
  onAddressesLoaded: (addresses: string[]) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ onAddressesLoaded }) => {
  const [inputText, setInputText] = useState<string>('');

  const parseAddressesFromText = (text: string): string[] => {
    if (!text) return [];
    
    // Split by newlines, commas, or spaces and filter out empty lines
    return text
      .split(/[\n,\s]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('0x'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addresses = parseAddressesFromText(inputText);
    if (addresses.length === 0) {
      alert('Please enter at least one valid address (starting with 0x)');
      return;
    }
    onAddressesLoaded(addresses);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Enter Wallet Addresses</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter addresses (one per line, comma-separated, or space-separated)
Example:
0x5c2a5956fabc76086489fdf4e666eb8492f541b8b6f6c189a4d033da92683f1a
0xac47e6fdf2f892d848b15a311ea7c2775d0cf35b25668b3a233cec6f5908dd80
0x18f62fd8421b58ea0a822dcc6c4933670bd3a4a2758f7269e201b2cdd95f52c1"
            value={inputText}
            onChange={handleInputChange}
          />
          <p className="text-sm text-gray-500 mt-2">
            Supports multiple addresses for scanning across all selected chains
          </p>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Load Portfolio
        </button>
      </form>
    </div>
  );
};

export default AddressInput;