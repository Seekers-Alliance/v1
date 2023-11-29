import { usePublicClient } from 'wagmi';
import { Hash } from 'viem';
import { getSupportedChainId } from '@/common';
import { useAddresses } from '@/hooks/useAddresses';
import { useEffect, useRef } from 'react';
import {
  EventData,
  RandomWordsFulfilledParams,
  watchRandomWordsFulfilledEventsByRequestIds,
} from '@/core/event';

export default function useWaitRandomFulfilled(
  requestId: bigint[],
  listener: (e: EventData<RandomWordsFulfilledParams>) => void
) {
  const unwatch = useRef<() => void>();
  const chainId = getSupportedChainId();
  const { vrfAddress } = useAddresses();
  const client = usePublicClient({ chainId });

  useEffect(() => {
    unwatch.current = watchRandomWordsFulfilledEventsByRequestIds(
      client,
      vrfAddress,
      requestId,
      listener
    );
    return unwatch.current;
  }, [vrfAddress, client, requestId]);
  return unwatch.current;
}
