import {Address, ProxyProvider, IDappProvider} from "@elrondnetwork/erdjs";
import axios from "axios";

export default class OwnerAdress {
  address: Address;
  proxyProvider: ProxyProvider;
  signerProvider?: IDappProvider;

  constructor(contractAddress = '', provider: ProxyProvider, signer?: IDappProvider) {
    this.address = new Address(contractAddress);
    this.proxyProvider = provider;
    this.signerProvider = signer;
  }

  async currentFunds(ticker:String): Promise<Array<Object>> {
    let tokenBalance: Array<Object> = []
    await axios.get(`https://devnet-api.elrond.com/accounts/${this.address.toString()}/tokens?name=${ticker}`)
    .then((response) => {
        tokenBalance = response.data
    })
    return tokenBalance;
  }

  async currentMetaFunds(ticker:String): Promise<Array<Object>> {
    let tokenBalance: Array<Object> = []
    await axios.get(`https://devnet-api.elrond.com/accounts/${this.address.toString()}/nfts?name=${ticker}`)
    .then((response) => {
        tokenBalance = response.data
    })
    return tokenBalance;
  }
}
