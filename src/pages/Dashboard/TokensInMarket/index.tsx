import React, { useEffect, useState } from 'react';
import { useContext } from 'context';
import { Address, SmartContractAbi, SmartContract } from '@elrondnetwork/erdjs';
import { loadAbiRegistry } from '@elrondnetwork/erdjs/out/testutils';
import { BytesValue } from '@elrondnetwork/erdjs/';
import BuyTokenModal from '../../../components/BuyTokenModal'
import Denominate from "../../../components/Denominate";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import BigNumber from 'bignumber.js';
import InfoIcon from '@mui/icons-material/Info';
import { toHex, lkmexDates } from 'helpers/nominate';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import axios from "axios";

interface TokensInMarketType {
  loadingBalance: Boolean;
  balanceTokens: Array<any>;
}

interface ScStatistics {
  current_published_tokens: BigNumber,
  total_transactions: BigNumber,
  percent: BigNumber,
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} enterTouchDelay={0} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));

function MyTokens({balanceTokens, loadingBalance}: TokensInMarketType) {
  const { dapp, loggedIn, tokenForSaleContract } = useContext();
  const [loading, setLoading] = useState(false);
  const [uncodedDates, setUncodedDates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  function handleTooltipOpen(event: any, offer: any){
    getMarketAttributes(offer);
  }

  async function getMarketAttributes(x:any){
    setUncodedDates({});
    let identifier = `${x.ticker}-${toHex(x.nonce.toFixed())}`
    let response = await axios.get(`https://testnet-api.elrond.com/accounts/erd1gzfc5jgjxf5fl285qjsu49d6half9dkuhusq24dq8frn6jmm6kssuwdels/nfts/${identifier}`)
    let dates = response.data.attributes ? lkmexDates(response.data.attributes) : {};
    // let dates = response.data.attributes ? response.data.attributes : "AAAADAAAAAAAAANJAgAAAAAAAANKDwAAAAAAAANnAgAAAAAAAANoDwAAAAAAAAOFAgAAAAAAAAOGDwAAAAAAAAOjAgAAAAAAAAOkDwAAAAAAAAPBAgAAAAAAAAPCDgAAAAAAAAPfAgAAAAAAAAPgDgE=";
    setUncodedDates(dates);
  }

  let pageSize: number = 5;
  let tokens: any = [];

  async function getSCStatistics(){
      let abiRegistry = await loadAbiRegistry(["./houdinex.abi.json"]);
      let contract = new SmartContract({ address: new Address(tokenForSaleContract), abi: new SmartContractAbi(abiRegistry, ["Houdinex"]) });
      let interaction = contract.methods.getSCStatistics();
      let response = interaction.interpretQueryResponse(
          await dapp.proxy.queryContract(interaction.buildQuery())
      );
      let scStatistics: any = { exchanged_mex: new BigNumber(0), exchanged_lkmex: new BigNumber(0), total_transactions: new BigNumber(0), current_published_tokens: new BigNumber(0)};
      await response.values[0].fields.forEach((field: any) => {
        scStatistics[field.name] = field.value.value;
      });
      return scStatistics
  }

  async function getMarketTokens(page: number){
    let abiRegistry = await loadAbiRegistry(["./houdinex.abi.json"]);
    let contract = new SmartContract({ address: new Address(tokenForSaleContract), abi: new SmartContractAbi(abiRegistry, ["Houdinex"]) });
    let interaction = contract.methods.getMarketTokens([
      BytesValue.fromHex(toHex((page).toString())), //Page
      BytesValue.fromHex(toHex((pageSize).toString())) //PageSize
    ]);
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
    return tokens
  }

  const [myTokens, setMyTokens] = useState([]);
  const [scStatistics, setScStatistics] = useState<ScStatistics>();
  
  function changePage(event: any, pageNumber: number) {
    setLoading(true);
    getMarketTokens(pageNumber).then((response) => {
      setMyTokens(response);
    }).finally(() => {
      setLoading(false)
      setCurrentPage(pageNumber)
    })
  };


  function getPages() {
    if (scStatistics){
      if ((scStatistics.current_published_tokens.toNumber() / pageSize) < 1) {
        return 1
      } else {
        return Math.ceil(scStatistics.current_published_tokens.toNumber() / pageSize)
      }
    }
    return 1
  };


  useEffect(() => {
    changePage('', 1);
  }, []);

  useEffect(() => {
    getSCStatistics().then((response) => {
      setScStatistics(response)
    });
  }, []);

  var response: any = [];
  if (myTokens.length > 0) {
    myTokens.map((x: any, index) => {
      var dates: any = [];
      for (const [key, value] of Object.entries(uncodedDates)) {
          dates.push(
              <li key={index + ' ' + key}>
                  {value}% - {key}
              </li>
          )
      }
      response.push(
        <div className="card border-0 d-flex flex-row justify-content-between" key={index}>
          <span>
            <div style={{display: 'flex', margin: '15px 8px 5px 15px'}} >
              <ListItemIcon>
              <img className="token-symbol" src="https://media.elrond.com/tokens/asset/LKMEX-aab910/logo.svg" alt="" />
              </ListItemIcon>
              <ListItemText style={{textAlign: 'left'}}>
                  <Denominate decimals={4} value={x.balance} ticker={x.ticker} />
                  &nbsp;
                  <HtmlTooltip onOpen={ (e) => {handleTooltipOpen(e, x)} } title={
                      <React.Fragment><div>UNLOCK DATES</div>
                        <ul style={{marginLeft: "-25px", marginRight: "5px"}}>
                          {dates}
                        </ul>
                      </React.Fragment>
                    }
                  >
                    <InfoIcon fontSize="small" color="primary"/>
                </HtmlTooltip>
                  <br />
                  <small style={{marginTop: '-20px'}}>
                    <strong> 1 MEX ??? {(x.ex_rate/100).toString()} LKMEX </strong>
                    <br />
                    <span> MEX value ??? <Denominate decimals={2} value={x.balance.multipliedBy(x.ex_rate/100)} ticker="" /></span>
                  </small>
              </ListItemText>
            </div>
          </span>
          <BuyTokenModal tokens={[x]} loggedIn={loggedIn} loading={loading} balanceTokens={balanceTokens}/>
        </div>
      )
      return true;
    })
  } else {
    if(loading){
      let n = 1;
      while (n <= pageSize) {
        response.push(
          <div className="card border-0 d-flex flex-row justify-content-between" key={n}>
            <ListItemButton>
                <ListItemIcon>
                    <Skeleton variant="circular" width={40} height={40} />
                </ListItemIcon>
                <ListItemText>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                </ListItemText>
            </ListItemButton>
          </div>
        )
        n++;
      }
    } else {
      response.push(
        <div className="card border-0 d-flex flex-row justify-content-between" key="notLoading">
          <ListItemButton>
              <ListItemText style={{textAlign: "center",  padding: "2em" }}>
                  No LKMEX for sale at this moment
              </ListItemText>
          </ListItemButton>
        </div>
      )
    }
  }
  
  return (
    <div>
      <br />
      <Pagination style={{marginBottom: '5px'}} count={getPages()} color="secondary" onChange={changePage}/>
      {
        (loggedIn)
        ? <div style={{fontSize:'14px', padding: '5px', backgroundColor: '#3e3e39', marginBottom: '10px', color: 'rgb(247, 220, 7)'}} >
            <small style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              Tokens are sorted by lowest exchange rate first.
              {
                (currentPage < 2) && (myTokens.length > 0)
                ?
                  <div style={{maxWidth: '80%'}}> These are some of the lowest priced tokens. Other buyers may be trying to purchase them at the same time.</div>
                : ""
              }
            </small>
          </div>
        : ''
      }
      {response}
      
      <style dangerouslySetInnerHTML={{__html:
        ` .css-1v2lvtn-MuiPaginationItem-root { color: white !important; }
          .MuiPaginationItem-root { color: white !important; }
          .MuiButtonBase-root-MuiPaginationItem-root { color: white !important; }
          .css-19micn4-MuiButtonBase-root-MuiPaginationItem-root { color: white !important; }
          .MuiPagination-ul{ justify-content: center; } `
      }}>
      </style>

    </div>
  )

};

export default MyTokens;
