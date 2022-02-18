import React from 'react';
import { faBan, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import State from 'components/State';
import { useContext } from 'context';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

const Home = () => {
  const { loading, error } = useContext();

  const ref = React.useRef(null);

  function handleOnClick(){
      window.location.href = "/buy";
  }

  return (
    <div ref={ref} className="home d-flex flex-fill align-items-center">
      {error ? (
        <State
          icon={faBan}
          iconClass="text-primary"
          title="Something went wrong"
          description="If the problem persists please contact support."
        />
      ) : loading ? (
        <State icon={faCircleNotch} iconClass="fa-spin text-primary" />
      ) : (
        <div className="m-auto login-container">
          <div className="card my-spacer text-center">
            <div className="card-body p-spacer mx-lg-spacer">
              <div className='landing'>
                <img style={{width: '300px'}} src="/Houdinex-logo-sm.png" alt="houdinex logo" />
              </div>
              <h4 className="mb-spacer">P2P EXCHANGE</h4>
              <p className="lead mb-spacer">
                Trade your LKMEX tokens in a peer-to-peer exchange
              </p>
              <div>
                <ButtonGroup style={{justifyContent: "center", width: '100%', boxShadow: 'none'}} variant="contained" aria-label="outlined primary button group">
                    <Button onClick={handleOnClick} size="small">Trade LKMEX</Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
