import {
  getTransactionInfo,
  TransactionAction,
} from '@/components/transaction';
import { useCallback } from 'react';
import { notification } from 'antd';

export default function useTxnNotify() {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = useCallback(
    (title: string, description: string) => {
      api.open({
        message: title,
        description: description,
        duration: 3,
      });
    },
    [api]
  );

  const handleTxnResponse = useCallback(
    (
      action: TransactionAction,
      isError: boolean,
      isSuccess: boolean,
      error: Error | null
    ) => {
      const { title, description } = getTransactionInfo(action, isError);
      if (isError) {
        const msg = `${description}, err is ${
          //@ts-ignore
          error?.shortMessage || error?.message
        }`;
        console.log(msg);
        openNotification(title, msg);
      }
      if (isSuccess) {
        openNotification(title, description);
      }
    },
    [openNotification]
  );
  return { handleTxnResponse, contextHolder };
}
