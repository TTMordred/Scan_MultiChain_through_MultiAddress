import { useState } from 'react';
import AddressInput from './components/AddressInput';
import MultiChainPortfolioTable from './components/MultiChainPortfolioTable';
import { scanChainPortfolio } from './utils/chainUtils';
import { getSuiBalance } from './utils/suiUtils';
import { Account, ChainPortfolio } from './types';
import { Wallet } from 'lucide-react';

function App() {
  const [address, setAddress] = useState<string>('');

  const handleAddressesLoaded = async (addresses: string[]) => {
    if (addresses.length > 0) {
      setAddress(addresses[0]);
    }
  };

  const handleScanChain = async (address: string, chainKey: string): Promise<ChainPortfolio> => {
    if (chainKey === 'SUI') {
      // Handle SUI chain scanning
      try {
        const balances = await getSuiBalance(address);
        const account: Account = {
          address,
          balances,
          loading: false,
          chain: 'SUI'
        };
        
        const totalBalance = balances
          .find(b => b.symbol === 'SUI')?.balance || '0';

        return {
          accounts: [account],
          totalBalance,
          chain: 'SUI'
        };
      } catch (error) {
        throw new Error(`Failed to scan SUI chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Handle other chains using chainUtils
      return await scanChainPortfolio(chainKey, address);
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

        {address && (
          <MultiChainPortfolioTable 
            address={address}
            onScanChain={handleScanChain}
          />
        )}
      </div>
    </div>
  );
}

export default App;