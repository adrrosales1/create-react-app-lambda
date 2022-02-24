import React, { useEffect, useState } from 'react';
import { useContext, useDispatch } from 'context';
import { Address, SmartContractAbi, SmartContract } from '@elrondnetwork/erdjs';
import { AccountType } from 'helpers/contractDataDefinitions';
import { getItem } from 'storage/session';
import SendFundsModal from '../../components/SendFundsModal'
import Tokens from "../../components/Tokens";
import {OwnerAdress} from '../../contracts';
import MyTokens from './MyTokens'
import TokensInMarket from './TokensInMarket';
import WalletLogin from '../Home/Login/Wallet';
import { loadAbiRegistry } from '@elrondnetwork/erdjs/out/testutils';
import { buf2hex, hex2a } from 'helpers/nominate';
import BigNumber from 'bignumber.js';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Dashboard = () => {
  const {loggedIn, dapp, address, tokenForSaleContract, walletConnectAccount} = useContext();
  const dispatch = useDispatch();

  const fetchAccount = () => {
    if (loggedIn) {
      dapp.proxy.getAccount(new Address(address)).then(account => {
        dispatch({
          type: 'setAccount',
          account: new AccountType(account.balance.toString(), account.nonce),
        });
      });
    }
  };

  const isWalletConnect = getItem('walletConnectLogin') && !walletConnectAccount;
  const dispatchLoginType = () => {
    if (isWalletConnect) {
      dispatch({
        type: 'setWalletConnectAccount',
        walletConnectAccount: address,
      });
    }
  };

  const [scInfo, setSCInfo] = useState({
    percent: new BigNumber(0), accepted_buy_tokens: "", accepted_sale_tokens: ""
  });
  async function getSCInfo(){
    let abiRegistry = await loadAbiRegistry(["./houdinex.abi.json"]);
    let contract = new SmartContract({ address: new Address(tokenForSaleContract), abi: new SmartContractAbi(abiRegistry, ["Houdinex"]) });
    let interaction = contract.methods.getSCInfo();
    let response = interaction.interpretQueryResponse(
      await dapp.proxy.queryContract(interaction.buildQuery())
    );
    let scStatistics: any = { percent: new BigNumber(0), accepted_buy_tokens: "", accepted_sale_tokens: ""};
    await response.values[0].fields.forEach((field: any) => {
      scStatistics[field.name] = field.value.type.name === "bytes" ? hex2a(buf2hex(field.value.value)) : field.value.value;
    });
    return scStatistics;
  }

  useEffect(() => {
    getSCInfo().then((response) => {
      setSCInfo(response);
    });
  }, []);
  
  var url = window.location.pathname
  const [token, setToken] = useState(new Array());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if(loggedIn && scInfo.accepted_buy_tokens && scInfo.accepted_sale_tokens){
      setLoading(true);
      const crowdfundContract = new OwnerAdress(address, dapp.proxy);
      // let token = (url === '/buy' ? scInfo.accepted_sale_tokens.split('-')[0] : scInfo.accepted_buy_tokens.split('-')[0])
      let token = (url === '/buy' ? 'MEX' : 'LockedMEX')
      crowdfundContract[url === '/buy' ? 'currentFunds' : 'currentMetaFunds'](token)
      .then((value: Array<Object>) => {
          if(value.length > 0){
              setToken(value);
          }
      })
      .catch(err => console.warn(err))
      .finally(() => setLoading(false))
    }
  }, [loggedIn, scInfo]);

  function fakeToken(){
    let ticker = (url === '/buy' ? token : 'LKMEX')
    let tickerSvg = (url === '/buy' ? 'MEX-455c57' : 'LKMEX-aab910')
    return [{assets:{svgUrl:`https://media.elrond.com/tokens/asset/${tickerSvg}/logo.svg`}, balance: "0", ticker}];
  }
  
  useEffect(fetchAccount, /* eslint-disable react-hooks/exhaustive-deps */ []);
  useEffect(dispatchLoginType, /* eslint-disable react-hooks/exhaustive-deps */ []);

  return (
    <div className="dashboard" style={{width: '100%', textAlign: 'center'}}>
        <Accordion style={{fontSize:'15px', padding: '5px', backgroundColor: '#3e3e39', marginBottom: '10px', color: 'rgb(247, 220, 7)'}}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon style={{color: 'white'}} />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <span style={{justifyContent: 'center', width: '100%', color: 'white'}}>
                You are currently in the TESTNET
            </span>
          </AccordionSummary>
          <AccordionDetails>
            To interact with the dapp, follow the next steps:
            <br />
            <ol style={{textAlign: 'left', color: 'white', fontSize: '14px'}}>
              <li>
                Get some xEGLD in the <a style={{textDecoration: 'underline'}} href="https://testnet-wallet.elrond.com/" target="_blank" rel="noreferrer">TESTNET WALLET</a> (faucet menu)
              </li>
              <li>Swap the xEGLD for MEX on the <a style={{textDecoration: 'underline'}} href="https://testnet.maiar.exchange/swap" target="_blank" rel="noreferrer">TESTNET MAIAR EXCHANGE</a></li>
              <li>You are ready to buy some LKMEX published on the Market!!</li>
            </ol>
          </AccordionDetails>
        </Accordion>
        
      {loggedIn ? (url === "/sell" ? <h5> LKMEX you can sell </h5> : <h5> MEX you can use to buy </h5>) : '' }
      {
        loggedIn 
        ? <div className="card border-0 d-flex align-items-center">
            <Tokens tokens={token.length > 0 ? token : fakeToken()} loading={false} />
            { url === "/sell" ? <span> <SendFundsModal action="Sell" tokens={token} loading={loading} /></span> : "" }
          </div>
        : <div className="card border-0 d-flex align-items-center">
              <h5 style={{marginTop:'20px'}} > Elrond wallet log in </h5>
              <WalletLogin />
          </div>
      }
      <br />
      <br />
      <div style={{textAlign: 'center'}}>
        {
          url === "/sell"
            ? (
                loggedIn
                ? <span>
                    <h5> Your LKMEX for sale </h5>
                    <MyTokens/>
                  </span>
                : ''
              )
            : <span>
                <h5> LKMEX in the market </h5>
                <TokensInMarket balanceTokens={token} loadingBalance={loading}/>
              </span>
        }
      </div>
    </div>
  );
};

export default Dashboard;
