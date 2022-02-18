import {SmartContract, Address, ProxyProvider, ContractFunction,
  Transaction, TransactionPayload, Balance, GasLimit, IDappProvider,
  WalletProvider} from "@elrondnetwork/erdjs";
import { setItem } from '../storage/session';
import { nominateValToHex, toHex } from 'helpers/nominate';
import { AccountType, BuyOrWithdrawTransactionType } from '../helpers/contractDataDefinitions';

export default class BuyOrWithdraw {
  contract: SmartContract;
  proxyProvider: ProxyProvider;
  signerProvider?: IDappProvider;
  account?: AccountType;

  constructor(
    provider: ProxyProvider,
    contractAddress?: string,
    signer?: IDappProvider,
    account?: AccountType
  ) {
    const address = new Address(contractAddress);
    this.contract = new SmartContract({ address });
    this.proxyProvider = provider;
    this.signerProvider = signer;
    this.account = account;
  }

  async sendTransaction(
    BuyOrWithdrawTT: BuyOrWithdrawTransactionType
  ): Promise<Transaction> {
    if (!this.signerProvider) {
      throw new Error(
        'You need a singer to send a transaction, use WalletProvider'
      );
    }

    switch (this.signerProvider.constructor) {
      case WalletProvider:
        // Can use something like this to handle callback redirect
        setItem('transaction_identifier', true, 120);
        return this.sendTransactionBasedOnType(BuyOrWithdrawTT);
      default:
        console.warn('invalid signerProvider');
    }

    throw new Error('invalid signerProvider');
  }

  private async sendTransactionBasedOnType(
    BuyOrWithdrawTT: BuyOrWithdrawTransactionType
  ): Promise<any> {
      let quantity = BuyOrWithdrawTT.value ? (BuyOrWithdrawTT.value).toLocaleString().replace(/,/g, '') : "0";
      if (!BuyOrWithdrawTT.value){
        return "errors"
      }
      let funcName = 'withdraw'
        + '@' + toHex(BuyOrWithdrawTT.token.self_index.toFixed()) // self index
        + '@' + nominateValToHex(quantity); // Hexadecimal VALUE

      let gasLimit = 10000000;
      const func = new ContractFunction(funcName);
      let payload = TransactionPayload.contractCall()
        .setFunction(func)
        .build();
      let transaction = new Transaction({
        chainID: BuyOrWithdrawTT.chainId,
        receiver: this.contract.getAddress(),
        value: Balance.egld(0),
        gasLimit: new GasLimit(gasLimit),
        data: payload,
        nonce: this.account?.nonce,
      });

      return await (this.signerProvider ? this.signerProvider.sendTransaction(transaction) : "");
  }

}
