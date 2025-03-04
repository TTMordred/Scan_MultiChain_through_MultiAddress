import React, { useState } from 'react';
import { parseAddressesFromText } from '../utils/suiUtils';

interface AddressInputProps {
  onAddressesLoaded: (addresses: string[]) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ onAddressesLoaded }) => {
  const [inputText, setInputText] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addresses = parseAddressesFromText(inputText);
    onAddressesLoaded(addresses);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Enter SUI Addresses</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          placeholder="Enter SUI addresses, one per line (e.g., 0x123...)"
          value={inputText}
          onChange={handleInputChange}
        />
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