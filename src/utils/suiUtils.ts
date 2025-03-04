import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

// Initialize SUI client
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

/**
 * Get the SUI balance for a specific address
 */
export const getSuiBalance = async (address: string): Promise<string> => {
  try {
    const balance = await client.getBalance({
      owner: address,
    });
    
    // Convert balance from MIST to SUI (1 SUI = 10^9 MIST)
    const suiBalance = Number(balance.totalBalance) / 10**9;
    return suiBalance.toFixed(4);
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
export const generateCsv = (accounts: { address: string; balance?: string }[]): string => {
  // CSV header
  let csvContent = "Address,Balance\n";
  
  // Add each account as a row
  accounts.forEach(account => {
    const balance = account.balance || "0.0000";
    csvContent += `${account.address},${balance}\n`;
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