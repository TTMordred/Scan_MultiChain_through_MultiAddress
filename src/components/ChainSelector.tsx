import React from 'react';
import { SUPPORTED_CHAINS } from '../types';
import { Check } from 'lucide-react';

interface ChainSelectorProps {
  selectedChains: string[];
  onChainToggle: (chainKey: string) => void;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChains,
  onChainToggle,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {Object.entries(SUPPORTED_CHAINS).map(([chainKey, chain]) => (
        <button
          key={chainKey}
          onClick={() => onChainToggle(chainKey)}
          className={`
            flex items-center justify-between p-4 rounded-lg border-2 
            ${
              selectedChains.includes(chainKey)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }
            transition-colors duration-200
          `}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {chain.symbol}
              </div>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{chain.name}</p>
              <p className="text-sm text-gray-500">{chain.symbol}</p>
            </div>
          </div>
          {selectedChains.includes(chainKey) && (
            <Check className="h-5 w-5 text-blue-500" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ChainSelector;