import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { Route } from 'react-router-dom';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Redeem from './pages/Redeem';
import Buyout from './pages/Buyout';
import Payout from './pages/Payout';
import { AppContextProvider } from './AppContext';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

const App = () => {
  if (window.ethereum) {
    window.ethereum.on('networkChanged', () => window.location.reload());
  }

  return (
    <AppContextProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <div>
          <Header />
          <Route exact path="/" component={Home} />
          <Route exact path="/market" component={Buyout} />
          <Route exact path="/redeem" component={Redeem} />
          <Route exact path="/payout" component={Payout} />
        </div>
      </Web3ReactProvider>
    </AppContextProvider>
  );
};

export default App;
