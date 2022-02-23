import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import BigNumber from "bignumber.js";
import Denominate from "../Denominate";
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Modal from '@mui/material/Modal';
import NumberFormat from 'react-number-format';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
// import Slider from '@mui/material/Slider';


import { TokenForSaleTransactionType, BuyOrWithdrawTransactionType, BuyTokenTransactionType } from 'helpers/contractDataDefinitions';
import { useBuyToken } from 'helpers/useBuyToken';
import { useTokenForSaleWallet } from 'helpers/useTokenForSale';
import { useBuyOrWithdrawToken } from 'helpers/useBuyOrWithdrawToken';

interface SendFundsModalType {
  loading: Boolean;
  tokens: Array<any>;
  action: String
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

function SendFundsModal({tokens, loading, action}: SendFundsModalType) {
  const [open, setOpen] = React.useState(false);
  const [token, setToken] = React.useState(0);
  const [exchangeRate, setExchangeRate] = React.useState<any | null>(null);
  const [error, setError] = React.useState('');
  const [formError, setFormError] = React.useState('');
  const [exRateError, setExRateError] = React.useState('');
  const [quantityError, setQuantityError] = React.useState('');
  const [quantity, setQuantity] = React.useState<any | null>(null);

  const sendFunds = () => handleTokenForSale();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { sendTransactionWallet } = useTokenForSaleWallet();
  const { sendTransactionBuyOrWithdraw } = useBuyOrWithdrawToken();
  const { sendTransactionBuyToken } = useBuyToken();

  function actionData() {
    
    switch (action) {
      case "Withdraw":
        return {
          afterLoadingText: "You haven't post any LKMEX tokens for sale",
          buttonText: "Withdraw tokens",
          ctaText: "Withdraw",
          description: "You will withdraw the tokens you <br/> previously published to the market",
          titleText: "Withdraw your LKMEX",
          tokenText: "Amount to withdraw",
        }
      default:
        return {
          afterLoadingText: "You don't have any LKMEX",
          buttonText: "Sell tokens",
          ctaText: "Post to marketplace",
          description: "Your LKMEX will be published to the market, <br/>where buyers will check your offer.",
          titleText: "Sell your LKMEX",
          tokenText: "Amount to sell",
        }
    }
  }

  function handleTokenForSale() {
    checkBalanceQuantity(quantity, token)
    if (action === "Sell") {
      checkExRate(exchangeRate)
      if(error === '' && exRateError === ''  && quantityError === ''){
        const txArguments = new TokenForSaleTransactionType(quantity, 'ESDTNFTTransfer', tokens[token], exchangeRate);
        sendTransactionWallet(txArguments);
      } else {
        setFormError('One or more fields contain errors');
      }
    } else if (action === "Buy") {
      if(error === '' && quantityError === ''){
        const txArguments = new BuyTokenTransactionType(quantity, 'ESDTNFTTransfer', tokens[token]);
        sendTransactionBuyToken(txArguments);
      } else {
        setFormError('One or more fields contain errors');
      }
    } else {
      if(error === '' && quantityError === ''){
        const txArguments = new BuyOrWithdrawTransactionType(quantity, 'ESDTNFTTransfer', tokens[token]);
        sendTransactionBuyOrWithdraw(txArguments);
      } else {
        setFormError('One or more fields contain errors');
      }
    }
  };


  function maxQuantity(){
    let value = new BigNumber(tokens[token].balance).dividedBy(Math.pow(10, 18));
    let maxValue = value.toString();
    setFormError('');
    setQuantityError('');
    setQuantity(maxValue);
    checkBalanceQuantity(maxValue, token);
  }
  
  function handleTokenChange(event:any){
    setError('');
    setFormError('');
    checkBalanceQuantity(quantity, event.target.value)
    setToken(event.target.value);
  }
  
  function handleExchangeRateChange(event:any){
    checkExRate(event.target.value);
    setExchangeRate(event.target.value);
  }
  
  function handleQuantityChange(event:any){
    if(token != null){
      setError('');
      setFormError('');
      checkBalanceQuantity(event.target.value, token)
      setQuantity(event.target.value);

    } else{
      setError('Token is required');
    }
  }

  function checkExRate(receivedExRate: string){
    setExRateError('');
    setFormError('');
    if (action === "Sell" ){
      if (!receivedExRate){
        setExRateError('Exchange rate is required');
        return 'error';
      }
      let dotIndex = receivedExRate.indexOf(".");
      if (dotIndex > -1 && ((receivedExRate.length - dotIndex - 1) > 2 )){
        setExRateError('Only 2 decimal places allowed');
      }
      let balance = parseFloat(receivedExRate.replace(/,/g, ''));
      if(balance < 0.2 || balance > 5){
        setExRateError('Exchange rate must be greater than 0.2 <br/> and less than 5');
      }
    }
  }

  function checkBalanceQuantity(receivedQ: any, receivedTokenId: any){
    let balance = new BigNumber(tokens[receivedTokenId].balance)
    let exponential = 'e+' + (tokens[receivedTokenId].decimals ? tokens[receivedTokenId].decimals : 18) 
    let parsedQuantity = receivedQ ? (new BigNumber(receivedQ.replace(/,/g, ""))).toFixed() : "0";
    let value = new BigNumber( parsedQuantity + exponential)
    let dotIndex = parsedQuantity ? parsedQuantity.indexOf(".") : null;
    if(value.isGreaterThan(balance)){
      setQuantityError('Insufficient funds');
    } else if (!value.isGreaterThanOrEqualTo(new BigNumber(30000 + exponential)) && action === 'Sell' ) {
      setQuantityError('Amount must be greater than 30,000');
    } else if (dotIndex && dotIndex > -1 && ((parsedQuantity.length - dotIndex - 1) > 18 )){
      setQuantityError('Only 18 decimal places allowed');
    } else {
      setQuantityError('');
    }
  }

  function menuItems(tokens: any) {
      let items: any = tokens.map((x: any, index: any) => {
        return (
            <MenuItem key={'menu-item' + index} value={index} style={{display: 'flex'}}>
              <span style={{flex: '1'}}>
                  <small style={{fontSize: '12px'}} >Nonce {(x.nonce ? ' #' + x.nonce : '')}</small>
                  <br />
                  {x.ticker}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <Denominate value={x.balance.toString()} ticker={x.ticker} showErd={false} decimals={4}/>
            </MenuItem>
          )
      }
    )
    return items
  };

  
  let response = (
    <div style={{alignSelf: 'center', marginBottom: tokens.length > 0 ? '' : '10px'}}>
      {
        loading
        ? <Skeleton variant="text" />
        : (
            tokens.length > 0
            ? <Button onClick={handleOpen}>{actionData().buttonText}</Button>
            : <small>{actionData().afterLoadingText}</small>
          )
      }
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{color: 'black'}}
      >
        <Box sx={style}>
          <Typography style={{textAlign: 'center'}} id="modal-modal-title" variant="h5" component="h2">
            <strong>{actionData().titleText}</strong>
          </Typography>
          <Typography style={{textAlign: 'center' }}>
            <small style={{fontFamily:"Poppins"}} dangerouslySetInnerHTML={{ __html: actionData().description }}></small>
            <HtmlTooltip title={<React.Fragment><div>If the remaining quantity after a buyer's purchase is less than 30,000 and more than 1 LKMEX, those tokens will be sent back to you.</div></React.Fragment>} >
                <InfoIcon fontSize="small" color="primary"/>
            </HtmlTooltip>
          </Typography>
          {/* Input */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            
            <FormControl variant="filled" fullWidth sx={{ m: 1}}>
              <InputLabel id="demo-simple-select-filled-label">Token</InputLabel>
              <Select
                labelId="demo-simple-select-filled-label"
                id="demo-simple-select-filled"
                value={token}
                onChange={handleTokenChange}
                sx={{ background: 'white' }}
              >
                {menuItems(tokens)}
              </Select>
              <small style={{color: 'red'}}>{error}</small>
            </FormControl>

            <FormControl fullWidth sx={{ m: 1 }} variant="filled">
              
              {/* Amount Input */}
              <NumberFormat
                autoComplete="off"  
                placeholder='0'
                allowNegative={false}
                thousandSeparator={true}
                value={quantity}
                customInput={TextField}
                variant="filled"
                label={actionData().tokenText}
                onChange={handleQuantityChange}
                InputProps={{
                  endAdornment:
                  <InputAdornment position="start">
                    <IconButton style={{fontSize: '10px', marginTop: '-10px'}} onClick={maxQuantity}>max</IconButton>
                  </InputAdornment>
                }}
              />
              <small style={{color: 'red'}}>{quantityError}</small>

              {action === 'Sell' ?
                ( <span>
                    <br/>
                    <span style={{textAlign: 'center'}}>
                      <HtmlTooltip title={<React.Fragment><div>Exchange rate at which you'll like to sell your LKMEX for MEX. <br/> Exchange rate must be greater than 0.2 and less than 5</div></React.Fragment>} >
                          <InfoIcon fontSize="small" color="primary"/>
                      </HtmlTooltip>
                      &nbsp;Exchange rate 
                    </span>
                    <span style={{display: 'flex', alignItems: 'end', justifyContent: 'center'}}>
                      <NumberFormat
                        autoComplete="off"
                        style={{width: '13rem'}}
                        allowNegative={false}
                        thousandSeparator={true}
                        value={exchangeRate}
                        customInput={TextField}
                        variant="filled"
                        size="small"
                        hiddenLabel
                        onChange={handleExchangeRateChange}
                        InputProps={{
                          inputProps: { style: { textAlign: "right", marginRight: '3px' } },
                          startAdornment: <InputAdornment position="start">1 LKMEX =</InputAdornment>,
                          endAdornment: <InputAdornment position="start">MEX</InputAdornment>
                        }}
                      />
                    </span>
                  </span>
                )
                : ''
              }
              {exRateError
                ? <small style={{color: 'red', textAlign: 'center', maxWidth: '40'}} dangerouslySetInnerHTML={{ __html: exRateError }}></small>
                : (quantity && exchangeRate)
                  ? <small style={{textAlign: 'center'}}> If your LKMEX is sold completely <br /> 
                      you'll receive ≈ <strong>{ ((quantity.replace(/,/g, ''))*(exchangeRate.replace(/,/g, ''))).toLocaleString() } MEX</strong>
                    </small>
                  : ''
              }

              <br/>
              <Button variant="contained" onClick={sendFunds} >
                {actionData().ctaText}
              </Button>
              <small style={{color: 'red', textAlign: 'center', maxWidth: '40'}} dangerouslySetInnerHTML={{ __html: formError }}></small>
            </FormControl>
            {
              action === 'Sell'
              ? <div style={{fontSize:'14px', padding: '5px', marginBottom: '10px', color: 'rgb(99,99,99)', backgroundColor: 'rgb(229,229,229)', textAlign: 'center'}} >
                  <small>
                    We are still in a beta version. Please, be cautious and moderate the amount of tokens you post for sale.
                  </small>
                </div>
              : ''
            }

          </Box>

        </Box>
      </Modal>
    </div>
  )

  return response;
}

export default SendFundsModal;