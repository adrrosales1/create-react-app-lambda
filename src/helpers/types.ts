export interface AccountType {
  address: string;
  balance: string;
  nonce: number;
  code?: string;
}

export interface DelegationContractType {
  name: string;
  gasLimit: number;
  data: string;
}

export interface TokenForSaleContractType {
  name: string;
  gasLimit: number;
  data: string;
}

export interface ActionModalType {
  balance?: string;
  show: boolean;
  title: string;
  description: string;
  handleClose: () => void;
  handleContinue: (value: string) => void;
}
