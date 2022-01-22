import { TransactionState } from './states';

export async function processTxnError(e) {
  // eslint-disable-next-line no-console
  console.log(e);
  let txnStatus;
  let message;
  if (e.code && typeof e.code === 'number') {
    txnStatus = TransactionState.FAIL;
    if (Object.prototype.hasOwnProperty.call(e, 'data') && Object.prototype.hasOwnProperty.call(e.data, 'message')) {
      message = `Error - ${e.message}: ${e.data.message}`;
    } else {
      message = `Error - ${e.message}`;
    }
  } else if (Object.prototype.hasOwnProperty.call(e, 'message')) {
    txnStatus = TransactionState.FAIL;
    message = `Error: ${e.message}`;
  } else {
    txnStatus = TransactionState.ERROR;
    message = null;
  }
  return [txnStatus, message];
}
