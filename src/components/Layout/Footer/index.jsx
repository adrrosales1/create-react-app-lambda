import React from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';

const Footer = () => {
  return (
    <footer className="footer d-flex justify-content-center pb-spacer">
        <small style={{textAlign: 'center'}} >
            Find us on 
            <br />
            <a href="https://twitter.com/houdine_x" rel="noreferrer" target="_blank"><TwitterIcon/></a>
            &nbsp;&nbsp;
            <a href="https://t.me/+vN53pFhm2D4yZjcx" rel="noreferrer" target="_blank"><TelegramIcon/></a>
        </small>
    </footer>
  );
};

export default Footer;
