import React from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
// import TelegramIcon from '@mui/icons-material/Telegram';

const Footer = () => {
  return (
    <footer className="footer d-flex justify-content-center pb-spacer">
        <small style={{textAlign: 'center'}} >
            Find us on 
            <br />
            <a href="https://twitter.com/houdine_x" rel="noreferrer" target="_blank"><TwitterIcon/></a>
            {/* <a href="http://"><TelegramIcon/></a> */}
        </small>
    </footer>
  );
};

export default Footer;
