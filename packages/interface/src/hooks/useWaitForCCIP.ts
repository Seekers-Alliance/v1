import useDrawingConfig from '@/hooks/useDrawingConfig';
import {
  useContractEvent,
  useContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';
import useDrawingWrite from '@/hooks/useDrawingWrite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Hash, parseAbi } from 'viem';
import {
  filterMarketplaceEvents,
  mappingMessageReceivedParams,
} from '@/core/events/marketplace';
import { getEvent } from '@/core/events/event';
import { useAddresses } from '@/hooks/useAddresses';
import { MessageReceivedParams } from '@/core/types';
import useWatchMarketplaceEvent from '@/hooks/useWatchMarketplaceEvent';

export default function useWaitForCCIP(
  chainId: number,
  senderHash?: `0x${string}`
) {
  console.log('useWaitForCCIP hash', senderHash);
  const { marketplaceReceiverAddress } = useAddresses();
  const messageIdRef = useRef<string>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [receiverHash, setReceiverHash] = useState<Hash | null>(null);
  const {
    data: senderReceipt,
    isLoading: isSenderLoading,
    error: senderError,
    isSuccess: isSenderSuccess,
  } = useWaitForTransaction({
    chainId: chainId,
    hash: senderHash,
  });
  console.log('senderReceipt', senderReceipt);
  console.log('wait status', isSenderLoading, isSenderSuccess, senderError);
  console.log('wait local status', isLoading, isSuccess, isError, error);
  const checkReceived = useCallback(
    (log: any) => {
      return log.args.messageId === messageIdRef.current;
    },
    [messageIdRef.current]
  );
  const filter = useCallback(
    (event: any) => {
      return event.args.messageId === messageIdRef.current;
    },
    [messageIdRef.current]
  );
  const { event, stopWatch } = useWatchMarketplaceEvent(
    'MessageReceived',
    filter
  );
  console.log('messageIdRef', messageIdRef.current);
  console.log('event', event);
  useEffect(() => {
    if (senderReceipt) {
      const event = filterMarketplaceEvents('MessageSent', senderReceipt.logs);
      if (!event) {
        setError(new Error('MessageSent event not found'));
      } else {
        console.log(event);
        messageIdRef.current = event.args.messageId;
      }
    }
  }, [senderReceipt]);

  useEffect(() => {
    if (messageIdRef.current) {
      setIsLoading(true);
    }
  }, [messageIdRef.current]);

  useEffect(() => {
    if (senderError) {
      setError(senderError);
      setIsError(true);
      setIsSuccess(false);
    }
    if (isSenderLoading) {
      setIsLoading(true);
    }
  }, [senderError, isSenderLoading]);
  useEffect(() => {
    if (event) {
      setReceiverHash(event.transactionHash);
      setIsSuccess(true);
      setIsLoading(false);
      setError(null);
      setIsError(false);
      stopWatch();
    }
  }, [event, stopWatch]);
  return {
    messageId: messageIdRef.current,
    isLoading,
    isSuccess,
    isError,
    error,
    senderHash,
    receiverHash,
  };
}
