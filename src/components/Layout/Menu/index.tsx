import React from 'react';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

const Menu = () => {
  
  const redirect = (url:string) => {
    window.location.href = '/' +url
  };
  
  let url = window.location.pathname

  let active = {};
  let inactive = {backgroundColor: 'rgb(56 55 55)', color: 'rgb(171 163 163)'};

  return (
    <ButtonGroup style={{justifyContent: "center", width: '100%', boxShadow: 'none'}} variant="contained" aria-label="outlined primary button group">
        <Button size="small" onClick={() => redirect('buy')} style={url === '/buy' ? active : inactive} >Buy LKMEX</Button>
        <Button size="small" onClick={() => redirect('sell')} style={url === '/sell' ? active : inactive} >Sell LKMEX</Button>
    </ButtonGroup>
  );
};

export default Menu;
