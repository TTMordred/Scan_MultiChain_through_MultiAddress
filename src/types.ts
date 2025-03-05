export interface CoinBalance {
  coinType: string;
  symbol: string;
  balance: string;
  decimals: number;
  chain?: string;
}

export interface Account {
  address: string;
  balances: CoinBalance[];
  loading: boolean;
  error?: string;
  chain: string;
}

export interface ChainPortfolio {
  accounts: Account[];
  totalBalance: string;
  chain: string;
}

export interface MultiChainPortfolio {
  portfolios: ChainPortfolio[];
  totalBalance: string;
}

export interface ChainConfig {
  name: string;
  rpcUrl: string;
  chainId: string | number;
  symbol: string;
  explorer: string;
  enabled?: boolean;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  SUI: {
    name: 'Sui',
    rpcUrl: 'https://sui-mainnet-rpc.nodereal.io',
    chainId: 'sui',
    symbol: 'SUI',
    explorer: 'https://explorer.sui.io',
    enabled: true
  },
  ETH: {
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '1',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
    enabled: true
  },
  LINEA: {
    name: 'Linea',
    rpcUrl: 'https://linea-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '59144',
    symbol: 'ETH',
    explorer: 'https://lineascan.build'
  },
  POLYGON: {
    name: 'Polygon',
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '137',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  BASE: {
    name: 'Base',
    rpcUrl: 'https://base-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '8453',
    symbol: 'ETH',
    explorer: 'https://basescan.org'
  },
  BLAST: {
    name: 'Blast',
    rpcUrl: 'https://blast-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '81457',
    symbol: 'ETH',
    explorer: 'https://blastscan.io'
  },
  OPTIMISM: {
    name: 'Optimism',
    rpcUrl: 'https://optimism-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '10',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io'
  },
  ARBITRUM: {
    name: 'Arbitrum',
    rpcUrl: 'https://arbitrum-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '42161',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io'
  },
  AVALANCHE: {
    name: 'Avalanche',
    rpcUrl: 'https://avalanche-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '43114',
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io'
  },
  STARKNET: {
    name: 'Starknet',
    rpcUrl: 'https://starknet-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: 'SN_MAIN',
    symbol: 'ETH',
    explorer: 'https://starkscan.co'
  },
  ZKSYNC: {
    name: 'zkSync',
    rpcUrl: 'https://zksync-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '324',
    symbol: 'ETH',
    explorer: 'https://explorer.zksync.io'
  },
  BSC: {
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '56',
    symbol: 'BNB',
    explorer: 'https://bscscan.com'
  },
  MANTLE: {
    name: 'Mantle',
    rpcUrl: 'https://mantle-mainnet.infura.io/v3/7a23b99fe6a24d838217039bb067305e',
    chainId: '5000',
    symbol: 'MNT',
    explorer: 'https://explorer.mantle.xyz'
  }
}