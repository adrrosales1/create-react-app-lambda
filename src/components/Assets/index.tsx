import React from 'react';
import Denominate from "../Denominate";
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { lkmexDates } from '../../helpers/nominate';

interface AssetType {
  value: Array<Object>;
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

function Asset({value}: AssetType) {
    var response: any = [];
    var dates: any = [];
    value.map((x: any, index) => {
        x.lkmexDates = (x.attributes ? lkmexDates(x.attributes) : '') 
        for (const [key, value] of Object.entries(x.lkmexDates)) {
            dates.push(
                <li key={index + ' ' + key}>
                    {value}% - Unlocks on {key}
                </li>
            )
        }
        response.push(
            <ListItemButton key={index} sx={{ pl: 4 }}>
                <ListItemIcon>
                    <img className="token-symbol" src="https://media.elrond.com/tokens/asset/LKMEX-aab910/logo.svg" alt="" />
                </ListItemIcon>
                <ListItemText>
                    <div className="d-sm-flex">
                        <div style={{flex: "1"}}>
                            {x.ticker +  (x.nonce ? (' #' + x.nonce) : "")}&nbsp;
                            {   dates.length > 0
                                ? (
                                    <HtmlTooltip title={<React.Fragment><div>UNLOCK DATES</div><ul style={{marginLeft: "-25px", marginRight: "5px"}}>{dates}</ul></React.Fragment>} >
                                        <InfoIcon fontSize="small" color="primary"/>
                                    </HtmlTooltip>
                                )
                                : ""
                            }
                        </div>
                        <Denominate value={x.balance.toString()} ticker={x.ticker} showErd={false} decimals={4}/>
                    </div>
                </ListItemText>
            </ListItemButton>
        );
        dates = []
        return true
    })
    return (<div>{response}</div>)
}

export default Asset;
