export interface SuiAccount {
  address: string;
  balance?: string;
  loading: boolean;
  error?: string;
}

export interface SuiPortfolio {
  accounts: SuiAccount[];
  totalBalance: string;
}