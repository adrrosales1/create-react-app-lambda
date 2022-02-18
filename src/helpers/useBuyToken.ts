import { useContext } from '../context';
import { BuyToken } from '../contracts';
import { BuyTokenTransactionType } from './contractDataDefinitions';
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
  const tokenForSale = new BuyToken(dapp.proxy, tokenForSaleContract, dapp.provider, account);

  const sendTransaction = (transactionArguments: BuyTokenTransactionType) => {
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

        console.error(`${transactionArguments}`, e);
      });
  };

  return { sendTransaction };
}

export function useBuyToken() {
  const { dapp, tokenForSaleContract, account } = useContext();
  const transaction = new BuyToken(dapp.proxy, tokenForSaleContract, dapp.provider, account);
  const sendTransactionBuyToken = (transactionArguments: BuyTokenTransactionType) => {
    transaction
      .sendTransaction(transactionArguments)
      .then()
      .catch(e => {
        console.error(`${transactionArguments}`, e);
      });
  };

  return { sendTransactionBuyToken };
}
