import React, { useEffect, useState } from 'react';
import { useContext, useDispatch } from 'context';
import { Address } from '@elrondnetwork/erdjs';
import { AccountType } from 'helpers/contractDataDefinitions';
import { getItem } from 'storage/session';
import SendFundsModal from '../../components/SendFundsModal'
import Tokens from "../../components/Tokens";
import {OwnerAdress} from '../../contracts';
import MyTokens from './MyTokens'
import TokensInMarket from './TokensInMarket';
import WalletLogin from '../Home/Login/Wallet';

const Dashboard = () => {
  const {loggedIn, dapp, address, walletConnectAccount} = useContext();
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
  
  var url = window.location.pathname
  const [token, setToken] = useState(new Array());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if(loggedIn){
      setLoading(true);
      const crowdfundContract = new OwnerAdress(address, dapp.proxy);
      // let token = (url === '/buy' ? 'MEX' : 'LockedMEX')
      let token = (url === '/buy' ? 'DMEX' : 'TLMEX')
      crowdfundContract[url === '/buy' ? 'currentFunds' : 'currentMetaFunds'](token)
      .then((value: Array<Object>) => {
          if(value.length > 0){
              setToken(value);
          }
      })
      .catch(err => console.warn(err))
      .finally(() => setLoading(false))
    }
  }, [loggedIn]);

  function fakeToken(){
    let ticker = (url === '/buy' ? token : 'LKMEX')
    let tickerSvg = (url === '/buy' ? 'MEX-455c57' : 'LKMEX-aab910')
    return [{assets:{svgUrl:`https://media.elrond.com/tokens/asset/${tickerSvg}/logo.svg`}, balance: "0", ticker}];
  }
  
  useEffect(fetchAccount, /* eslint-disable react-hooks/exhaustive-deps */ []);
  useEffect(dispatchLoginType, /* eslint-disable react-hooks/exhaustive-deps */ []);

  return (
    <div className="dashboard" style={{width: '500px', textAlign: 'center'}}>
        
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
