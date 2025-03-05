export interface CoinBalance {
  coinType: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export interface SuiAccount {
  address: string;
  balances: CoinBalance[];
  loading: boolean;
  error?: string;
}

export interface SuiPortfolio {
  accounts: SuiAccount[];
  totalBalance: string;
}