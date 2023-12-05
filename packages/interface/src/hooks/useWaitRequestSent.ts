import { usePublicClient, useWaitForTransaction } from 'wagmi';
import { Hash } from 'viem';
import { getSupportedChainId } from '@/common';

import { filterRequestSentEvents } from '@/core/events/event';
import { QueryResult } from '@/types';
import { EventData, RequestSentParams } from '@/core/types';

export default function useWaitRequestSent(
  hash: Hash
): QueryResult<EventData<RequestSentParams> | null> {
  const chainId = getSupportedChainId();
  const res = useWaitForTransaction({ chainId, hash });
  if (!res.data) {
    return { isLoading: res.isLoading, error: res.error, data: null };
  }
  const receipt = res.data;
  return {
    isLoading: res.isLoading,
    error: res.error,
    data: filterRequestSentEvents(receipt.logs),
  };
}
