import React, { useState } from 'react';
import { ChainPortfolio, SUPPORTED_CHAINS } from '../types';
import PortfolioTable from './PortfolioTable';
import ChainSelector from './ChainSelector';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { generateCsv, downloadFile } from '../utils/chainUtils';

interface MultiChainPortfolioTableProps {
  addresses: string[];
  onScanChain: (addresses: string[], chainKey: string) => Promise<ChainPortfolio>;
}

const MultiChainPortfolioTable: React.FC<MultiChainPortfolioTableProps> = ({ 
  addresses, 
  onScanChain 
}) => {
  const [selectedChains, setSelectedChains] = useState<string[]>(['SUI', 'ETH']);
  const [portfolios, setPortfolios] = useState<ChainPortfolio[]>([]);
  const [scanning, setScanning] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChainToggle = (chainKey: string) => {
    setSelectedChains(prev => 
      prev.includes(chainKey)
        ? prev.filter(key => key !== chainKey)
        : [...prev, chainKey]
    );
  };

  const handleScanChain = async (chainKey: string) => {
    setScanning(prev => ({ ...prev, [chainKey]: true }));
    setErrors(prev => ({ ...prev, [chainKey]: '' }));

    try {
      const result = await onScanChain(addresses, chainKey);
      setPortfolios(prev => {
        const filtered = prev.filter(p => p.chain !== chainKey);
        return [...filtered, result];
      });
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        [chainKey]: err instanceof Error ? err.message : 'An error occurred while scanning'
      }));
    } finally {
      setScanning(prev => ({ ...prev, [chainKey]: false }));
    }
  };

  const handleScanSelected = () => {
    selectedChains.forEach(chainKey => {
      handleScanChain(chainKey);
    });
  };

  const handleExportCsv = () => {
    if (portfolios.length === 0) return;
    const csvContent = generateCsv(portfolios);
    downloadFile(csvContent, 'multi_chain_portfolio.csv', 'text/csv');
  };

  // Calculate total balance across all chains in USD
  const totalBalance = portfolios.reduce(
    (sum, portfolio) => sum + parseFloat(portfolio.totalBalance),
    0
  ).toFixed(2);

  const activeScanCount = Object.values(scanning).filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Multi-Chain Portfolio Scanner</h1>
        <p className="text-gray-600 mb-6">Scanning {addresses.length} addresses across selected chains</p>

        <ChainSelector
          selectedChains={selectedChains}
          onChainToggle={handleChainToggle}
        />

        <div className="flex space-x-4 mb-8">
          <button
            onClick={handleScanSelected}
            disabled={selectedChains.length === 0 || activeScanCount > 0}
            className={`
              px-6 py-3 rounded-lg text-white font-semibold
              ${selectedChains.length === 0 || activeScanCount > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
              transition-colors flex items-center space-x-2
            `}
          >
            {activeScanCount > 0 && <Loader2 className="h-5 w-5 animate-spin" />}
            <span>
              {activeScanCount > 0
                ? `Scanning ${activeScanCount} Chain(s)...`
                : `Scan Selected Chains (${selectedChains.length})`
              }
            </span>
          </button>

          {portfolios.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {Object.entries(errors).map(([chain, error]) => (
          error && (
            <div key={chain} className="flex items-center space-x-2 text-red-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span>{chain}: {error}</span>
            </div>
          )
        ))}

        {portfolios.length > 0 && (
          <div className="mt-8 mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-2">Total Portfolio Value</h2>
            <p className="text-4xl font-bold">${totalBalance} USD</p>
          </div>
        )}
      </div>

      {selectedChains.map((chainKey) => {
        const portfolio = portfolios.find(p => p.chain === chainKey);
        const isScanning = scanning[chainKey];
        const error = errors[chainKey];

        if (!portfolio && !isScanning && !error) {
          return null;
        }

        return (
          <div key={chainKey} className="mb-8">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Error scanning {SUPPORTED_CHAINS[chainKey].name}: {error}
              </div>
            ) : isScanning ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Scanning {SUPPORTED_CHAINS[chainKey].name}...</span>
              </div>
            ) : portfolio && (
              <PortfolioTable
                accounts={portfolio.accounts}
                totalBalance={portfolio.totalBalance}
                chain={portfolio.chain}
                explorerUrl={SUPPORTED_CHAINS[portfolio.chain]?.explorer}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MultiChainPortfolioTable;