import { useState, useEffect } from 'react';
import AddressInput from './components/AddressInput';
import PortfolioTable from './components/PortfolioTable';
import { getSuiBalance } from './utils/suiUtils';
import { SuiAccount } from './types';
import { Wallet } from 'lucide-react';

interface AccountWithRetry extends SuiAccount {
  retryCount: number;
  error?: string;
}

function App() {
  const [accounts, setAccounts] = useState<SuiAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState<string>('0.0000');

  const handleAddressesLoaded = async (addresses: string[]) => {
    // Initialize accounts with loading state
    const initialAccounts: AccountWithRetry[] = addresses.map(address => ({
      address,
      loading: true,
      retryCount: 0,
    }));
    
    setAccounts(initialAccounts);
    
    // Process addresses in batches of 50
    const BATCH_SIZE = 50;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay between batches
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 seconds delay before retrying
    const updatedAccounts = [...initialAccounts];
    
    const processAddress = async (address: string, retryCount: number): Promise<AccountWithRetry> => {
      try {
        const balance = await getSuiBalance(address);
        return {
          address,
          balance,
          loading: false,
          retryCount,
        };
      } catch {
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return processAddress(address, retryCount + 1);
        }
        return {
          address,
          loading: false,
          error: 'Failed to fetch balance',
          retryCount,
        };
      }
    };

    // First pass: process all addresses
    for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
      const batch = addresses.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(
        batch.map(address => processAddress(address, 0))
      );
      
      batchResults.forEach(result => {
        const index = updatedAccounts.findIndex(a => a.address === result.address);
        if (index !== -1) {
          updatedAccounts[index] = result;
        }
      });
      
      setAccounts([...updatedAccounts]);
      
      if (i + BATCH_SIZE < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    // Filter failed addresses that haven't reached max retries
    const failedAddresses = updatedAccounts.filter(
      account => account.error && account.retryCount < MAX_RETRIES
    );

    // Retry failed addresses if any exist
    if (failedAddresses.length > 0) {
      const retryResults = await Promise.all(
        failedAddresses.map(account => 
          processAddress(account.address, account.retryCount)
        )
      );

      retryResults.forEach(result => {
        const index = updatedAccounts.findIndex(a => a.address === result.address);
        if (index !== -1) {
          updatedAccounts[index] = result;
        }
      });

      setAccounts([...updatedAccounts]);
    }
  };

  // Calculate total balance whenever accounts change
  useEffect(() => {
    const total = accounts.reduce((sum, account) => {
      if (account.balance) {
        return sum + parseFloat(account.balance);
      }
      return sum;
    }, 0);
    
    setTotalBalance(total.toFixed(4));
  }, [accounts]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <Wallet className="h-10 w-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">SUI Portfolio Tracker</h1>
          </div>
          <p className="text-gray-600">
            Track your SUI wallet balances in one place
          </p>
        </header>
        
        <AddressInput onAddressesLoaded={handleAddressesLoaded} />
        
        <PortfolioTable 
          accounts={accounts} 
          totalBalance={totalBalance} 
        />
      </div>
    </div>
  );
}

export default App;