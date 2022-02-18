import { object, string, InferType } from 'yup';
import { TokenForSaleContractType } from './helpers/types';

export const minDust: string = '5000000000000000'; // 0.005 EGLD
export const decimals: number = 2;
export const denomination: number = 18;
export const walletConnectBridge: string = 'https://bridge.walletconnect.org';
export const walletConnectDeepLink: string =
  'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/';

export const network: NetworkType = {
  id: 'testnet',
  name: 'Testnet',
  egldLabel: 'xEGLD',
  walletAddress: 'https://testnet-wallet.elrond.com/dapp/init',
  apiAddress: 'https://testnet-api.elrond.com',
  gatewayAddress: 'https://testnet-gateway.elrond.com',
  explorerAddress: 'http://testnet-explorer.elrond.com/',
  tokenForSaleContract: 'erd1qqqqqqqqqqqqqpgqnpf8gm4f53p4rxrpjz9054dulcrxc6a26kssdlsrr2',
};

const networkSchema = object({
  id: string()
    .defined()
    .required(),
  egldLabel: string()
    .defined()
    .required(),
  name: string()
    .defined()
    .required(),
  tokenForSaleContract: string(),
  walletAddress: string(),
  apiAddress: string(),
  gatewayAddress: string(),
  explorerAddress: string(),
}).required();

export type NetworkType = InferType<typeof networkSchema>;

networkSchema.validate(network, { strict: true }).catch(({ errors }) => {
  console.error(`Config invalid format for ${network.id}`, errors);
});

export const tokenForSaleContractData: TokenForSaleContractType[] = [
  {
    name: 'ESDTNFTTransfer',
    gasLimit: 6000000,
    data: 'ESDTNFTTransfer@',
  }
];
