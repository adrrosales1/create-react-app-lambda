import React, { useEffect, useState } from 'react';
import { useContext } from 'context';
import { Address, AddressValue, SmartContractAbi, SmartContract } from '@elrondnetwork/erdjs';
import { loadAbiRegistry } from '@elrondnetwork/erdjs/out/testutils';
import SendFundsModal from '../../../components/SendFundsModal'
import Tokens from "../../../components/Tokens";


function TokensInMarket(){
  const { dapp, address, tokenForSaleContract } = useContext();
  const [loading, setLoading] = useState(false);
  let tokens: any = [];

  async function getMyTokens(){
    let abiRegistry = await loadAbiRegistry(["./houdinex.abi.json"]);
    let contract = new SmartContract({ address: new Address(tokenForSaleContract), abi: new SmartContractAbi(abiRegistry, ["Houdinex"]) });
    let interaction = contract.methods.getMyTokens([new AddressValue(new Address(address))]);
    let response = interaction.interpretQueryResponse(
      await dapp.proxy.queryContract(interaction.buildQuery())
    );
    response.values[0].backingCollection.items.forEach((element: any) => {
      let object: any = {index: null, ex_token: null, ex_rate: null, nonce: null, quantity: null, token: null,}
      element.fields.forEach((field: any) => {
        let objectName = field.name === 'token' ? 'ticker' : (field.name === 'quantity' ? 'balance' : field.name ); 
        object[objectName] = field.value.type.name === "TokenIdentifier" ? String.fromCharCode.apply(null, field.value.value) : field.value.value;
      });
      tokens.push(object)
    });
    setLoading(false);
  }

  const [myTokens, setMyTokens] = useState([]);
  useEffect(() => {
    setLoading(true);
    getMyTokens()
    .then(() => setMyTokens(tokens))
    .finally( () => setLoading(false))
  }, []);
  
  return (
    <div className="card border-0 d-flex align-items-center">
        <Tokens tokens={myTokens} loading={loading} />
        <SendFundsModal action="Withdraw" tokens={myTokens} loading={loading} />
    </div>
  )

};

export default TokensInMarket;
