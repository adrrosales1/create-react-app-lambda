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
import Modal from '@mui/material/Modal';
import NumberFormat from 'react-number-format';
import TextField from '@mui/material/TextField';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
// import Slider from '@mui/material/Slider';
import '../../assets/styles/pages/custom.scss';


import { BuyTokenTransactionType } from 'helpers/contractDataDefinitions';
import { useBuyToken } from 'helpers/useBuyToken';

interface SendFundsModalType {
  loggedIn: Boolean;
  loading: Boolean;
  tokens: Array<any>;
  balanceTokens: Array<any>;
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

function tokensValue(tokens: any) {
  if (tokens?.length !== 0){
    let totals = tokens.map((x: any) => x.balance)
    let summedValues = BigNumber.sum.apply(null, totals)
    return Number(summedValues).toLocaleString().replace(/,/g, '')
  }
  return '0'
}

function SendFundsModal({tokens, loading, balanceTokens, loggedIn}: SendFundsModalType) {
  const [open, setOpen] = React.useState(false);
  const [token] = React.useState(0);
  const [error, setError] = React.useState('');
  const [formError, setFormError] = React.useState('');
  const [quantityError, setQuantityError] = React.useState('');
  const [quantity, setQuantity] = React.useState<any | null>(null);

  const sendFunds = () => handleTokenForSale();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { sendTransactionBuyToken } = useBuyToken();

  function actionData() {
      return {
        buttonText: "Buy tokens",
        ctaText: "Buy",
        description: "Buy LKMEX Tokens with your MEX tokens",
        titleText: "Buy LKMEX",
        tokenText: "Amount to buy",
      }
  }

  function handleTokenForSale() {
    checkBalanceQuantity(quantity, token)
    if(error === '' && quantityError === ''){
      let exchangeRate = tokens[token].ex_rate.dividedBy(100);
      let exchangeQuantity = new BigNumber(quantity.replace(/,/g, '')).multipliedBy(exchangeRate);
      const txArguments = new BuyTokenTransactionType(exchangeQuantity.toString(), 'ESDTNFTTransfer', tokens[token]);
      sendTransactionBuyToken(txArguments);
    } else {
      setFormError('One or more fields contain errors');
    }
  };


  function maxQuantity(){
    let offered_quantity = tokens[token].balance.dividedBy(Math.pow(10, 18));
    let balance = new BigNumber(Number(tokensValue(balanceTokens))/Math.pow(10, 18));
    let smaller = balance.isGreaterThan(offered_quantity) ? offered_quantity : balance;
    let maxValue = smaller.toString();

    setFormError('');
    setQuantityError('');
    setQuantity(maxValue);
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

  function checkBalanceQuantity(receivedQ: any, receivedTokenId: any){
    let balance = new BigNumber(tokens[receivedTokenId].balance)
    let exponential = 'e+' + (tokens[receivedTokenId].decimals ? tokens[receivedTokenId].decimals : 18) 
    let parsedQuantity = receivedQ ? receivedQ.replace(/,/g, "") : 0;
    let value = new BigNumber( parsedQuantity + exponential)

    let exchangeRate = tokens[receivedTokenId].ex_rate.dividedBy(100);
    let quantityToBuy = value.dividedBy(exchangeRate);
    let dotIndex = parsedQuantity.indexOf(".");
    if(value.isGreaterThan(balance)){
      setQuantityError('Amount must be equal or less than what is offered');
    } else if (value.isGreaterThan(new BigNumber(tokensValue(balanceTokens)))){
        setQuantityError('Insufficient funds');
    } else if (quantityToBuy.isLessThan(new BigNumber(30000 + exponential))){
      setQuantityError('Minimum purchase: ' + (exchangeRate*30000).toLocaleString() + ' MEX' );
    } else if (dotIndex > -1 && ((parsedQuantity.length - dotIndex - 1) > 18 )){
        setQuantityError('Only 18 decimal places allowed');
    } else {
      setQuantityError('');
    }
  }

  function menuItems(tokens: any) {
      let items: any = tokens.map((x: any, index: any) => {
        return (
            <div key={'menu-item' + index} style={{margin: '8px', width: '100%'}}>
              <div style={{backgroundColor: "#F0F0F0", padding: "4px 20px 5px", borderRadius: "4px 4px 0px 0px", borderBottom: "#959393 1px solid" }}>
              <span style={{flex: '1', textAlign: 'right', opacity: '.5', fontSize: "12px", display:'flex', justifyContent: 'space-between'}}>
                  <small style={{fontSize: '12px'}} >Nonce {(x.nonce ? ' #' + x.nonce : '')}</small>
                  <div>1 LKMEX ≈ {x.ex_rate.dividedBy(100).toString()} MEX</div>
              </span>
              <span style={{display:'flex', justifyContent: 'space-between', fontSize: '14px'}}>
              <span style={{flex: '1'}}>
                  {x.ticker}
              </span>
              <Denominate value={x.balance.toString()} ticker={x.ticker} showErd={false} decimals={2}/>
              </span>
              </div>
            </div>
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
        : ( loggedIn
            ? <Button onClick={handleOpen}>{actionData().buttonText}</Button>
            : <HtmlTooltip title={<React.Fragment><div>Log in to buy LKMEX tokens</div></React.Fragment>} >
                <div style={{marginRight: '20px', fontFamily: 'Roboto', fontWeight: 'bold', fontSize: '14px', opacity: '50%', color: 'rgb(24,117,209)'}} >BUY TOKENS</div>
              </HtmlTooltip>
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
          </Typography>
          {/* Input */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            
            
            {menuItems(tokens)}

            <FormControl fullWidth sx={{ m: 1 }} variant="filled">
              
              {/* Amount Input */}
              <small style={{textAlign: 'right', opacity: '.5'}} >
                Balance: <Denominate decimals={4} value={tokensValue(balanceTokens)} ticker=""/>
              </small>
              <NumberFormat
                autoComplete="off"  
                placeholder='0'
                thousandSeparator={true}
                value={quantity}
                customInput={TextField}
                variant="filled"
                label={actionData().tokenText}
                onChange={handleQuantityChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment:
                  <InputAdornment position="start">
                    <IconButton style={{fontSize: '10px', marginTop: '-10px'}} onClick={maxQuantity}>max</IconButton>
                  </InputAdornment>
                }}
              />
              <small style={{color: 'red'}}>{quantityError}</small>
              {
                (quantity)
                  ? <small style={{textAlign: 'center'}}> You will pay ≈&nbsp;
                      <strong>
                        { quantity ? parseFloat(tokens[0].ex_rate.dividedBy(100).multipliedBy(quantity.replace(/,/g, '')).toFixed()).toLocaleString() : 0 } MEX
                      </strong>
                      <br />
                    </small>
                  : ''
              }
              <br/>
              <Button variant="contained" onClick={sendFunds} >
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <div> No fees at the moment</div>
                    </React.Fragment>
                  }
                >
                    <InfoIcon fontSize="small" />
                </HtmlTooltip>
                &nbsp;{actionData().ctaText}
              </Button>
              <small style={{color: 'red', textAlign: 'center', maxWidth: '40'}} dangerouslySetInnerHTML={{ __html: formError }}></small>
            </FormControl>

            <div style={{fontSize:'14px', padding: '5px', marginBottom: '10px', color: 'rgb(99,99,99)', backgroundColor: 'rgb(229,229,229)', textAlign: 'center'}} >
              <small>
                We are still in a beta version. Please, be cautious and moderate the amount of tokens you buy.
              </small>
            </div>

          </Box>

        </Box>
      </Modal>
    </div>
  )

  return response;
}

export default SendFundsModal;