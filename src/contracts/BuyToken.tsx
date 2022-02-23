import {SmartContract, Address, ProxyProvider, ContractFunction,
  Transaction, TransactionPayload, Balance, GasLimit, IDappProvider,
  WalletProvider} from "@elrondnetwork/erdjs";
import { setItem } from '../storage/session';
import { nominateValToHex, toHex } from 'helpers/nominate';
import { AccountType, BuyTokenTransactionType } from '../helpers/contractDataDefinitions';
import BigNumber from "bignumber.js";

export default class BuyToken {
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
    BuyTokenTT: BuyTokenTransactionType
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
        return this.sendTransactionBasedOnType(BuyTokenTT);
      default:
        console.warn('invalid signerProvider');
    }

    throw new Error('invalid signerProvider');
  }

  private async sendTransactionBasedOnType(
    BuyTokenTT: BuyTokenTransactionType
  ): Promise<any> {
    let quantity = BuyTokenTT.value 
    ? (BuyTokenTT.value).toLocaleString().replace(/,/g, '') : "0";
    let quantityNumber = new BigNumber(quantity).decimalPlaces(18);
    let exchangeRate = BuyTokenTT.token.ex_rate.dividedBy(100)
    if (!BuyTokenTT.value || (quantityNumber.dividedBy(exchangeRate)).isLessThan(30000)){
      return "errors"
    }
    let funcName = 'ESDTTransfer'
      + '@' + Buffer.from(BuyTokenTT.token.ex_token, 'utf8').toString('hex') // Hexadecimal encoded TOKEN
      + '@' + nominateValToHex(quantityNumber.toFixed()) // Hexadecimal VALUE
      + '@6275795f746f6b656e' // buy_token on HEX
      + '@' + BuyTokenTT.token.address.valueHex // seller address HEX
      + '@' + toHex(BuyTokenTT.token.self_index.toString()); // self index on HEX

      let gasLimit = 100000000;
      const func = new ContractFunction(funcName);
      let payload = TransactionPayload.contractCall()
        .setFunction(func)
        .build();
      let transaction = new Transaction({
        chainID: BuyTokenTT.chainId,
        receiver: this.contract.getAddress(),
        value: Balance.egld(0),
        gasLimit: new GasLimit(gasLimit),
        data: payload,
        nonce: this.account?.nonce,
      });

      return await (this.signerProvider ? this.signerProvider.sendTransaction(transaction) : "");
  }

}
