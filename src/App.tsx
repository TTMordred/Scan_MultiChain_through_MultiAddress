import { useState } from 'react';
import AddressInput from './components/AddressInput';
import MultiChainPortfolioTable from './components/MultiChainPortfolioTable';
import { scanChainPortfolio } from './utils/chainUtils';
import { getSuiBalance } from './utils/suiUtils';
import { Account, ChainPortfolio } from './types';
import { Wallet } from 'lucide-react';

function App() {
  const [addresses, setAddresses] = useState<string[]>([]);

  const handleAddressesLoaded = async (newAddresses: string[]) => {
    setAddresses(newAddresses);
  };

  const handleScanChain = async (addresses: string[], chainKey: string): Promise<ChainPortfolio> => {
    if (chainKey === 'SUI') {
      // Handle SUI chain scanning for multiple addresses
      try {
        const accounts: Account[] = await Promise.all(
          addresses.map(async (address) => {
            try {
              const balances = await getSuiBalance(address);
              return {
                address,
                balances,
                loading: false,
                chain: 'SUI'
              };
            } catch (error) {
              return {
                address,
                balances: [],
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                chain: 'SUI'
              };
            }
          })
        );
        
        // Calculate total balance across all addresses
        const totalBalance = accounts.reduce((sum, account) => {
          const suiBalance = account.balances.find(b => b.symbol === 'SUI')?.balance || '0';
          return sum + parseFloat(suiBalance);
        }, 0).toFixed(4);

        return {
          accounts,
          totalBalance,
          chain: 'SUI'
        };
      } catch (error) {
        throw new Error(`Failed to scan SUI chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Handle other chains using chainUtils
      return await scanChainPortfolio(chainKey, addresses);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <Wallet className="h-10 w-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Multi-Chain Portfolio Tracker</h1>
          </div>
          <p className="text-gray-600">
            Track your crypto portfolio across multiple blockchains
          </p>
        </header>
        
        <AddressInput onAddressesLoaded={handleAddressesLoaded} />

        {addresses.length > 0 && (
          <MultiChainPortfolioTable 
            addresses={addresses}
            onScanChain={handleScanChain}
          />
        )}
      </div>
    </div>
  );
}

export default App;