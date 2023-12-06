import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import useDrawingWrite from '@/hooks/useDrawingWrite';
import {useEffect, useMemo, useRef} from 'react';
import { Hash } from 'viem';

export default function useDrawingTxn(fn: string) {
  const hashRef = useRef<Hash>();
  const hash = hashRef.current;
  const {
    data: submitData,
    write: submit,
    isLoading: isSubmitLoading,
    isError: isSubmitError,
    isSuccess: isSubmitSuccess,
    error: submitError,
  } = useDrawingWrite(fn);
  const {
    data: confirmData,
    isError: isConfirmError,
    isLoading: isConfirmLoading,
    error: confirmError,
    isSuccess: isConfirmSuccess,
  } = useWaitForTransaction({
    hash: submitData?.hash,
    chainId: 43113,
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
