import { Address } from 'abitype';

export interface RequestSentReceipt {
  requestId: bigint;
  requester: Address;
  blockNumber: bigint;
}

export interface QueryResult<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
}
