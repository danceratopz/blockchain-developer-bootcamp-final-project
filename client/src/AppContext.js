import React, { createContext, useReducer } from 'react';

const initialContext = {
  ethBalance: '--',
  setEthBalance: () => {},
  isWalletConnectionModalOpen: false,
  setWalletConnectModal: () => {},
  accountLastTxnHash: undefined,
  setAccountLastTxnHash: () => {},
  contentError: undefined,
  setContentError: () => {},
};

const appReducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_ETH_BALANCE':
      return {
        ...state,
        ethBalance: payload,
      };

    case 'SET_WALLET_MODAL':
      return {
        ...state,
        isWalletConnectModalOpen: payload,
      };

    case 'SET_ACCOUNT_LAST_TXN_HASH':
      return {
        ...state,
        accountLastTxnHash: payload,
      };

    case 'SET_CONTENT_ERROR':
      return {
        ...state,
        contentError: payload,
      };

    default:
      return state;
  }
};

const AppContext = createContext(initialContext);

export const useAppContext = () => React.useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const [store, dispatch] = useReducer(appReducer, initialContext);

  const contextValue = {
    ethBalance: store.ethBalance,
    setEthBalance: (balance) => {
      dispatch({ type: 'SET_ETH_BALANCE', payload: balance });
    },
    isWalletConnectModalOpen: store.isWalletConnectModalOpen,
    setWalletConnectModal: (open) => {
      dispatch({ type: 'SET_WALLET_MODAL', payload: open });
    },
    accountLastTxnHash: store.accountLastTxnHash,
    setAccountLastTxnHash: (status) => {
      dispatch({ type: 'SET_ACCOUNT_LAST_TXN_HASH', payload: status });
    },
    contentError: store.contentError,
    setContentError: (str) => {
      dispatch({ type: 'SET_CONTENT_ERROR', payload: str });
    },
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
