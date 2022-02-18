import { useContext } from '../context';
import { TokenForSale } from '../contracts';
import { TokenForSaleTransactionType } from './contractDataDefinitions';
import { ledgerErrorCodes } from './ledgerErrorCodes';
export interface UseTokenForSaleType {
//   handleClose: (txHash: TransactionHash) => void;
  setError: (error: string) => void;
}
export default function useTokenForSale({
//   handleClose,
  setError: setTransactionError,
}: UseTokenForSaleType) {
  const { dapp, tokenForSaleContract, account, networkConfig } = useContext();
  const tokenForSale = new TokenForSale(dapp.proxy, tokenForSaleContract, dapp.provider, account);

  const sendTransaction = (transactionArguments: TokenForSaleTransactionType) => {
    transactionArguments.chainId = networkConfig.chainId;
    tokenForSale
      .sendTransaction(transactionArguments)
      .then(transaction => {
        // handleClose(transaction.getHash());
      })
      .catch(e => {
        if (e.statusCode in ledgerErrorCodes) {
          setTransactionError((ledgerErrorCodes as any)[e.statusCode].message);
        }
        if (e.message === 'HWApp not initialised, call init() first') {
          setTransactionError('Your session has expired. Please login again');
        }
        if (e.message === 'Failed or Rejected Request') {
          setTransactionError('Failed or Rejected Request. Please try again');
        }
        if (e.message === 'cancel') {
          setTransactionError('Transaction Cancelled');
        }

        console.error(`${transactionArguments.type}`, e);
      });
  };

  return { sendTransaction };
}

export function useTokenForSaleWallet() {
  const { dapp, tokenForSaleContract, account } = useContext();
  const tokenForSale = new TokenForSale(dapp.proxy, tokenForSaleContract, dapp.provider, account);
  const sendTransactionWallet = (transactionArguments: TokenForSaleTransactionType) => {
    tokenForSale
      .sendTransaction(transactionArguments)
      .then()
      .catch(e => {
        console.error(`${transactionArguments.type}`, e);
      });
  };

  return { sendTransactionWallet };
}
