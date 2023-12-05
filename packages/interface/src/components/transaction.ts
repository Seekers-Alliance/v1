const SUBMITTED_TITLE = 'Transaction submitted';
const SUBMITTED_DESCRIPTION = 'Your transaction submission succeeded';
const CONFIRMED_TITLE = 'Transaction confirmed';
const CONFIRMED_DESCRIPTION = 'Your transaction confirmation succeeded';
const SUBMIT_FAILED_TITLE = 'Transaction submission failed';
const SUBMIT_FAILED_DESCRIPTION = 'Your transaction submission failed';
const CONFIRM_FAILED_TITLE = 'Transaction confirmation failed';
const CONFIRM_FAILED_DESCRIPTION = 'Your transaction confirmation failed';

export enum TransactionStatus {
  SUBMITTED,
  CONFIRMED,
  SUBMIT_FAILED,
  CONFIRM_FAILED,
}

export enum TransactionAction {
  SUBMIT,
  CONFIRM,
}

interface MessageTemplate {
  title: string;
  description: string;
}

function _getTransactionInfo(status: TransactionStatus): MessageTemplate {
  switch (status) {
    case TransactionStatus.SUBMITTED:
      return {
        title: SUBMITTED_TITLE,
        description: SUBMITTED_DESCRIPTION,
      };
    case TransactionStatus.CONFIRMED:
      return {
        title: CONFIRMED_TITLE,
        description: CONFIRMED_DESCRIPTION,
      };
    case TransactionStatus.SUBMIT_FAILED:
      return {
        title: SUBMIT_FAILED_TITLE,
        description: SUBMIT_FAILED_DESCRIPTION,
      };
    case TransactionStatus.CONFIRM_FAILED:
      return {
        title: CONFIRM_FAILED_TITLE,
        description: CONFIRM_FAILED_DESCRIPTION,
      };
  }
}

export function getTransactionInfo(
  action: TransactionAction,
  isFail: boolean
): MessageTemplate {
  let status: TransactionStatus;
  if (action === TransactionAction.SUBMIT) {
    status = isFail
      ? TransactionStatus.SUBMIT_FAILED
      : TransactionStatus.SUBMITTED;
  } else {
    status = isFail
      ? TransactionStatus.CONFIRM_FAILED
      : TransactionStatus.CONFIRMED;
  }
  return _getTransactionInfo(status);
}
