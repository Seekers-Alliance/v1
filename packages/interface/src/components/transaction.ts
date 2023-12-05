const SUBMITTED_TITLE = 'Submission successful';
const SUBMITTED_DESCRIPTION = 'Submission successful';
const CONFIRMED_TITLE = 'Confirmation successful';
const CONFIRMED_DESCRIPTION = 'Confirmation successful';
const SUBMIT_FAILED_TITLE = 'Submission failed';
const SUBMIT_FAILED_DESCRIPTION = 'Submission failed';
const CONFIRM_FAILED_TITLE = 'Confirmation failed';
const CONFIRM_FAILED_DESCRIPTION = 'Confirmation failed';

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
