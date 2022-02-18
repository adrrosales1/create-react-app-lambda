import Menu from '../Menu'
import { useContext, useDispatch } from 'context';
import useMediaQuery from '@mui/material/useMediaQuery';

const Navbar = () => {
  const matches = useMediaQuery('(min-width:600px)');
  const { loggedIn, dapp } = useContext();
  const dispatch = useDispatch();

  const logOut = () => {
    dispatch({ type: 'logout', provider: dapp.provider });
  };

  function handleOnClick(){
    window.location.href="/";
  }

  return (
    <div className="navbar px-4 py-3 flex-nowrap">
      <div className="container-fluid flex-nowrap">
        <div className="d-flex align-items-center" onClick={handleOnClick} style={{zIndex:200, cursor: 'pointer', marginRight: (matches ? '-60px' : '') }}>
          <img style={{width: (matches ? '110px' : '30px')}} src={!matches ? '/houdinex-only-logo-sm.png' : '/houdinex-vertical.png' } alt="houdinex logo" />
          &nbsp;|&nbsp;<small> Beta </small>
        </div>
        {loggedIn && <Menu />}
        {loggedIn && (
          <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
            <a href="/#" onClick={logOut} className="btn btn-primary btn-sm ml-3">
              Close
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
