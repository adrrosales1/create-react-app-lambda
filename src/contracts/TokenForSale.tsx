import {SmartContract, Address, ProxyProvider, ContractFunction,
  Transaction, TransactionPayload, Balance, GasLimit, IDappProvider,
  WalletProvider} from "@elrondnetwork/erdjs";
import { setItem } from '../storage/session';
import { nominateValToHex, toHex } from 'helpers/nominate';
import { AccountType, TokenForSaleTransactionType } from '../helpers/contractDataDefinitions';

export default class TokenForSale {
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
    TokenForSaleTT: TokenForSaleTransactionType
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
        return this.sendTransactionBasedOnType(TokenForSaleTT);
      default:
        console.warn('invalid signerProvider');
    }

    throw new Error('invalid signerProvider');
  }

  private async sendTransactionBasedOnType(
    TokenForSaleTT: TokenForSaleTransactionType
  ): Promise<any> {
      let quantity = TokenForSaleTT.value ? (TokenForSaleTT.value).toLocaleString().replace(/,/g, '') : "0";
      let exchangeRate = TokenForSaleTT.ex_rate ? parseFloat((TokenForSaleTT.ex_rate).toLocaleString().replace(/,/g, '')) : 0;
      if (!TokenForSaleTT.value || parseFloat(quantity) < 30000 || !TokenForSaleTT.ex_rate || exchangeRate < 0.2 || exchangeRate > 5){
        return "errors"
      }
      let funcName = 'ESDTNFTTransfer'
        + '@' + Buffer.from(TokenForSaleTT.token['collection'], 'utf8').toString('hex') // Hexadecimal encoded TOKEN
        + '@' + toHex(TokenForSaleTT.token['nonce']) // Version of the TOKEN
        + '@' + nominateValToHex(quantity) // Hexadecimal VALUE 
        + '@' + this.contract.getAddress()['valueHex'] // Hex ADDRESS
        + '@746f6b656e5f666f725f73616c65' // token_for_sale on HEX
        // + '@' + nominateValToHex(((TokenForSaleTT.ex_rate)).toLocaleString().replace(/,/g, '')); // args
        + '@' + toHex((exchangeRate * 100).toString()); // args

      let gasLimit = 10000000;
      const func = new ContractFunction(funcName);
      let payload = TransactionPayload.contractCall()
        .setFunction(func)
        .build();
      let transaction = new Transaction({
        chainID: TokenForSaleTT.chainId,
        receiver: this.contract.getAddress(),
        value: Balance.egld(0),
        gasLimit: new GasLimit(gasLimit),
        data: payload,
        nonce: this.account?.nonce,
      });

      // @ts-ignore
      return await this.signerProvider.sendTransaction(transaction);
  }

}
