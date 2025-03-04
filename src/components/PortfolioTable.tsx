import React from 'react';
import { SuiAccount } from '../types';
import { formatAddress, generateCsv, downloadFile } from '../utils/suiUtils';
import { ExternalLink, Loader2, Download, ArrowUpDown } from 'lucide-react';

interface PortfolioTableProps {
  accounts: SuiAccount[];
  totalBalance: string;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ accounts, totalBalance }) => {
  if (accounts.length === 0) {
    return null;
  }

  // Sort accounts by balance (highest to lowest)
  const sortedAccounts = [...accounts].sort((a, b) => {
    const balanceA = a.balance ? parseFloat(a.balance) : 0;
    const balanceB = b.balance ? parseFloat(b.balance) : 0;
    return balanceB - balanceA;
  });

  const handleExportCsv = () => {
    const csvContent = generateCsv(accounts);
    downloadFile(csvContent, 'sui_portfolio.csv', 'text/csv');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">SUI Portfolio</h2>
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
          Total Balance: <span className="font-bold">{totalBalance} SUI</span>
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Balance
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </div>
              </th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {account.loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading...</span>
                    </div>
                  ) : account.error ? (
                    <span className="text-red-500">Error: {account.error}</span>
                  ) : (
                    <span>{account.balance} SUI</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a 
                    href={`https://explorer.sui.io/address/${account.address}`} 
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