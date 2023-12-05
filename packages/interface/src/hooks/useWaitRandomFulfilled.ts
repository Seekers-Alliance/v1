import { usePublicClient } from 'wagmi';
import { Hash } from 'viem';
import { getSupportedChainId } from '@/common';
import { useAddresses } from '@/hooks/useAddresses';
import { useEffect, useRef } from 'react';
import { watchRandomWordsFulfilledEventsByRequestIds } from '@/core/events/event';
import { EventData, RandomWordsFulfilledParams } from '@/core/types';

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
