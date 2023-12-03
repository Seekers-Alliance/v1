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

export enum PoolProcessStatus {
  SelectNFT,
  CreateUnit,
  CreatePool,
  Done,
}

export const TOKEN_LIST=[
    BigInt(1),
    BigInt(2),
    BigInt(3),
    BigInt(4),
    BigInt(10),
    BigInt(20),
    BigInt(100),
]
