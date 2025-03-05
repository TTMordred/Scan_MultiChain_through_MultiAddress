import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { CoinBalance, SuiAccount } from '../types';

// Initialize SUI client
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

/**
 * Get all coin balances for a specific address
 */
export const getSuiBalance = async (address: string): Promise<CoinBalance[]> => {
  try {
    const allCoins = await client.getAllCoins({ owner: address });
    
    // Map coins to CoinBalance format
    const balances: CoinBalance[] = allCoins.data
      .filter(coin => BigInt(coin.balance) > BigInt(0)) // Only include coins with balance > 0
      .map(coin => {
        const decimals = 9; // Most Sui tokens use 9 decimals
        const balance = (Number(coin.balance) / Math.pow(10, decimals)).toFixed(4);
        
        // Extract symbol from coin type (e.g., "0x2::sui::SUI" -> "SUI")
        const parts = coin.coinType.split('::');
        const symbol = parts.length > 2 ? parts[2] : parts[parts.length - 1];

        return {
          coinType: coin.coinType,
          symbol,
          balance,
          decimals,
        };
      });

    return balances;
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error);
    throw error;
  }
};

/**
 * Parse SUI addresses from a text string
 */
export const parseAddressesFromText = (text: string): string[] => {
  if (!text) return [];
  
  // Split by newlines and filter out empty lines
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.startsWith('0x'));
};

/**
 * Format SUI address for display (truncate middle)
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 16) return address;
  
  return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
};

/**
 * Generate CSV content from accounts data
 */
export const generateCsv = (accounts: SuiAccount[]): string => {
  // Get all unique coin symbols
  const allSymbols = Array.from(new Set(
    accounts.flatMap(account => account.balances.map(b => b.symbol))
  )).sort();

  // CSV header with all coin types
  let csvContent = `Address,${allSymbols.join(',')}\n`;
  
  // Add each account as a row
  accounts.forEach(account => {
    const balances = allSymbols.map(symbol => {
      const coinBalance = account.balances.find(b => b.symbol === symbol);
      return coinBalance ? coinBalance.balance : '0.0000';
    });
    csvContent += `${account.address},${balances.join(',')}\n`;
  });
  
  return csvContent;
};

/**
 * Download content as a file
 */
export const downloadFile = (content: string, fileName: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};