import React, { useMemo } from 'react';
import { Account } from '../types';
import { formatAddress, generateCsv, downloadFile } from '../utils/suiUtils';
import { ExternalLink, Loader2, Download, ArrowUpDown } from 'lucide-react';

interface PortfolioTableProps {
  accounts: Account[];
  totalBalance: string;
  chain: string;
  explorerUrl?: string;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ accounts, totalBalance, chain, explorerUrl }) => {
  // Get all unique coin symbols across all accounts
  const uniqueSymbols = useMemo(() => {
    const symbols = new Set<string>();
    accounts.forEach(account => {
      account.balances.forEach(balance => {
        symbols.add(balance.symbol);
      });
    });
    return Array.from(symbols).sort();
  }, [accounts]);

  if (accounts.length === 0) {
    return null;
  }

  // Sort accounts by native token balance (highest to lowest)
  const sortedAccounts = [...accounts].sort((a, b) => {
    const balanceA = a.balances.find((bal) => bal.symbol === chain)?.balance || '0';
    const balanceB = b.balances.find((bal) => bal.symbol === chain)?.balance || '0';
    return parseFloat(balanceB) - parseFloat(balanceA);
  });

  const handleExportCsv = () => {
    const csvContent = generateCsv(accounts);
    downloadFile(csvContent, `${chain.toLowerCase()}_portfolio.csv`, 'text/csv');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{chain} Portfolio</h2>
        <button
          onClick={handleExportCsv}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg">
          Total Balance: <span className="font-bold">{totalBalance} {chain}</span>
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              {uniqueSymbols.map(symbol => (
                <th 
                  key={symbol} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    {symbol}
                    {symbol === chain && <ArrowUpDown className="h-3 w-3 ml-1" />}
                  </div>
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAccounts.map((account, index) => (
              <tr key={account.address} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatAddress(account.address)}
                </td>
                {uniqueSymbols.map(symbol => (
                  <td key={symbol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.loading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading...</span>
                      </div>
                    ) : account.error ? (
                      <span className="text-red-500">Error: {account.error}</span>
                    ) : (
                      <span>
                        {account.balances.find((bal) => bal.symbol === symbol)?.balance || '0.0000'} {symbol}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a 
                    href={`${explorerUrl}/address/${account.address}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                  >
                    Explorer <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;