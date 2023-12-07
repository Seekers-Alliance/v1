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
  const handleReceived = useCallback(
    (log: any) => {
      if (checkReceived(log)) {
        setReceiverHash(log.transactionHash);
        setError(null);
        setIsSuccess(true);
        setIsLoading(false);
      }
    },
    [checkReceived]
  );
  console.log('handleReceived', handleReceived);
  const unwatch = useContractEvent({
    address: marketplaceReceiverAddress,
    abi: parseAbi([
      'event MessageReceived(bytes32 indexed messageId,uint64 indexed sourceChainSelector)',
    ]),
    eventName: 'MessageReceived',
    listener(log) {
      console.log('MessageReceived log', log);
      if (checkReceived(log)) {
        unwatch?.();
        handleReceived(log);
      }
    },
    chainId: 43113,
  });
  console.log('unwatch', unwatch);
  console.log('messageIdRef', messageIdRef.current);
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
