import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import useDrawingWrite from '@/hooks/useDrawingWrite';
import { useEffect, useMemo, useRef } from 'react';
import { Hash } from 'viem';
import useMarketplaceWrite from '@/hooks/useMarketplaceWrite';
import useCoinWrite from '@/hooks/useCoinWrite';

export default function useCoinTxn(coin: string, fn: string) {
  const hashRef = useRef<Hash>();
  const {
    data: submitData,
    write: submit,
    isLoading: isSubmitLoading,
    isError: isSubmitError,
    isSuccess: isSubmitSuccess,
    error: submitError,
  } = useCoinWrite(coin, fn);
  const {
    data: confirmData,
    isError: isConfirmError,
    isLoading: isConfirmLoading,
    error: confirmError,
    isSuccess: isConfirmSuccess,
  } = useWaitForTransaction({
    hash: submitData?.hash,
  });
  const isLoading = useMemo(() => {
    return isSubmitLoading || isConfirmLoading;
  }, [isSubmitLoading, isConfirmLoading]);
  useEffect(() => {
    if (submitData) {
      hashRef.current = submitData.hash;
    }
  }, [submitData]);
  return {
    submit,
    isSubmitError,
    isSubmitSuccess,
    submitError,
    isConfirmError,
    confirmError,
    isConfirmSuccess,
    confirmData,
    hash: hashRef.current,
    isLoading: isLoading,
  };
}
