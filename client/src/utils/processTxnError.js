import { TxnState } from './states';

export async function processTxnError(e) {
  // eslint-disable-next-line no-console
  console.log(e);
  let txnStatus;
  let message;
  if (Object.prototype.hasOwnProperty.call(e, 'error') && Object.prototype.hasOwnProperty.call(e.error, 'message')) {
    // On Ropsten Metamask returns an 'error' field in the exception.
    txnStatus = TxnState.FAIL;
    message = `Error: ${e.error.message}`;
  } else if (
    Object.prototype.hasOwnProperty.call(e, 'data') &&
    Object.prototype.hasOwnProperty.call(e.data, 'message')
  ) {
    // On localhost the error from Metamask is directly available in the exception and in e.data.
    txnStatus = TxnState.FAIL;
    message = `Error - ${e.message}: ${e.data.message}`;
  } else if (Object.prototype.hasOwnProperty.call(e, 'message')) {
    // The case on Ropsten and Localhost if user rejects the transaction.
    txnStatus = TxnState.ERROR;
    message = `Error - ${e.message}`;
  } else {
    // An Unexpected error;
    txnStatus = TxnState.ERROR;
    message = null;
  }
  return [txnStatus, message];
}
