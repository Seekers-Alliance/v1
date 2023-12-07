import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Hash, parseAbi } from 'viem';
import useWatchDrawingEvent from "@/hooks/useWatchDrawingEvent";

export default function useWaitForFulfill(
  requestId?: bigint
) {
  console.log('useWaitForFulfill hash', requestId);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [fulfillHash, setFulfillHash] = useState<Hash | null>(null);

  console.log('wait local status', isLoading, isSuccess, isError, error);
  const filter=(event:any)=>{
    console.log(`filter event`,event)
    return event.args.requestId===requestId
  }
  const {event,stopWatch} = useWatchDrawingEvent('RequestFulfilled',filter)


  useEffect(() => {
    if (event) {
      console.log('RequestFulfilled log', event);
      setFulfillHash(event.transactionHash);
      setError(null);
      setIsSuccess(true);
      setIsLoading(false);
      stopWatch()
    }
  }, [event]);
  return {
    requestId: requestId,
    isLoading,
    isSuccess,
    isError,
    error,
    fulfillHash,
  };
}
