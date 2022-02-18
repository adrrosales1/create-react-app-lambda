import * as React from 'react';
import Assets from "../Assets";
import BigNumber from "bignumber.js";
import Collapse from '@mui/material/Collapse';
import Denominate from "../Denominate";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';


interface TokenType {
    tokens: Array<Object>;
    loading: Boolean;
}

function tokensValue(tokens: any) {
    if (tokens?.length !== 0){
        let totals = tokens.map((x: any) => x.balance)
        let summedValues = BigNumber.sum.apply(null, totals)
        return Number(summedValues).toLocaleString().replace(/,/g, '')
    }
    return '0'
}
function ticker(tokens: any) {
    return tokens?.length !== 0 ? tokens[0].ticker : ''
}
function imageUrl(tokens: any) {
    return tokens && tokens[0].assets && tokens[0].assets.svgUrl?.length !== 0 ? tokens[0].assets.svgUrl : 'https://media.elrond.com/tokens/asset/LKMEX-aab910/logo.svg'
}

function Token({tokens, loading}: TokenType) {
    let tokenButton = null
    const [open, setOpen] = React.useState(false);
    const handleClick = () => {
        setOpen(!open);
    };
    if (tokens.length === 1) {
        tokenButton = (
        <ListItemButton>
            <Assets value={tokens} />
        </ListItemButton>);
    } else if(tokens.length > 1) {
        tokenButton = (
            <span>
                <ListItemButton onClick={handleClick}>
                    <ListItemIcon>
                    <img className="token-symbol" src={imageUrl(tokens)} alt="" />
                    </ListItemIcon>
                    <ListItemText>
                        <Denominate decimals={4} value={tokensValue(tokens)} ticker={ticker(tokens)}/>
                    </ListItemText>
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <Assets value={tokens} />
                    </List>
                </Collapse>
            </span>
        );
    } else {
        tokenButton = !loading
        ? (
          <ListItemButton>
              <ListItemIcon>
                <img className="token-symbol" src={imageUrl(null)} alt="" />
              </ListItemIcon>
              <ListItemText>
                  <Denominate decimals={4} value="0" ticker={'LKMEX'}/>
              </ListItemText>
          </ListItemButton>
        )
        : (
            <ListItemButton>
              <ListItemIcon>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemIcon>
              <ListItemText>
                <Skeleton variant="text" />
              </ListItemText>
            </ListItemButton>
        )
    }
    return (
        <List sx={{ width: '100%', maxWidth: 500}} aria-labelledby="nested-list-subheader">
            {tokenButton}
        </List>
    );
    
}

export default Token;