import { usePublicClient, useWaitForTransaction } from 'wagmi';
import { Hash } from 'viem';
import { getSupportedChainId } from '@/common';

import {
  EventData,
  filterRequestSentEvents,
  RequestSentParams,
} from '@/core/event';
import { QueryResult } from '@/types';

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
