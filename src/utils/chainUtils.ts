import { ethers } from 'ethers';
import { Account, ChainPortfolio, SUPPORTED_CHAINS } from '../types';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

async function getEthBalance(provider: ethers.JsonRpcProvider, address: string): Promise<string> {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

async function getTokenBalance(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string,
  walletAddress: string
): Promise<{ balance: string; symbol: string; decimals: number }> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [balance, decimals, symbol] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.decimals(),
    contract.symbol()
  ]);
  
  return {
    balance: ethers.formatUnits(balance, decimals),
    symbol,
    decimals
  };
}

const COMMON_TOKENS: Record<string, string[]> = {
  ETH: [
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    '0x514910771AF9Ca656af840dff83E8264EcF986CA'  // LINK
  ],
  POLYGON: [
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
    '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39'  // LINK
  ],
  OPTIMISM: [
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // USDC
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
    '0x68f180fcCe6836688e9084f035309E29Bf0A2095', // WBTC
    '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6'  // LINK
  ],
  ARBITRUM: [
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC
    '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4'  // LINK
  ],
  BSC: [
    '0x55d398326f99059fF775485246999027B3197955', // USDT
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
    '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', // DAI
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // WBTC
    '0x404460C6A5EdE2D891e8297795264fDe62ADBB75'  // LINK
  ],
  AVALANCHE: [
    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', // DAI
    '0x50b7545627a5162F82A992c33b87aDc75187B218', // WBTC
    '0x5947BB275c521040051D82396192181b413227A3'  // LINK
  ],
  BASE: [
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' // USD+
  ]
};

export async function scanChainPortfolio(
  chainKey: string,
  address: string
): Promise<ChainPortfolio> {
  const chainConfig = SUPPORTED_CHAINS[chainKey];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chainKey}`);
  }

  const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
  const account: Account = {
    address,
    balances: [],
    loading: true,
    error: undefined,
    chain: chainKey
  };

  try {
    // Get native token balance
    const nativeBalance = await getEthBalance(provider, address);
    account.balances.push({
      coinType: 'native',
      symbol: chainConfig.symbol,
      balance: nativeBalance,
      decimals: 18,
      chain: chainKey
    });

    // Get common token balances
    const tokenAddresses = COMMON_TOKENS[chainKey] || [];
    const tokenBalances = await Promise.all(
      tokenAddresses.map(async (tokenAddress) => {
        try {
          const tokenData = await getTokenBalance(provider, tokenAddress, address);
          return {
            coinType: tokenAddress,
            ...tokenData,
            chain: chainKey
          };
        } catch (error) {
          console.error(`Error fetching token balance for ${tokenAddress}:`, error);
          return null;
        }
      })
    );

    // Add valid token balances
    account.balances.push(...tokenBalances.filter((b): b is NonNullable<typeof b> => b !== null));
    account.loading = false;

    // Calculate total balance in native tokens (simplified)
    const totalBalance = nativeBalance;

    return {
      accounts: [account],
      totalBalance,
      chain: chainKey
    };
  } catch (error) {
    account.loading = false;
    account.error = error instanceof Error ? error.message : 'Unknown error';
    return {
      accounts: [account],
      totalBalance: '0',
      chain: chainKey
    };
  }
}

export async function scanAllChains(address: string): Promise<ChainPortfolio[]> {
  const chainKeys = Object.keys(SUPPORTED_CHAINS);
  
  // Scan all chains concurrently
  const portfolios = await Promise.all(
    chainKeys.map(async (chainKey) => {
      try {
        return await scanChainPortfolio(chainKey, address);
      } catch (error) {
        console.error(`Error scanning ${chainKey}:`, error);
        return {
          accounts: [{
            address,
            balances: [],
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            chain: chainKey
          }],
          totalBalance: '0',
          chain: chainKey
        };
      }
    })
  );

  return portfolios;
}