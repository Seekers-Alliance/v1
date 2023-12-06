import { Address } from 'abitype';
import { Hash } from 'viem';

export interface GetEventParams<T> {
  address: Address;
  eventName: string;
  abi: unknown[];
  args: T;
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
}

export interface EventData<T> {
  address: Address;
  blockHash: Hash;
  blockNumber: bigint;
  logIndex: number;
  transactionHash: Hash;
  args: T;
}

export interface RandomWordsFulfilledParams {
  requestId: bigint;
  outputSeed: bigint;
  payment: bigint;
  success: boolean;
}

export interface RequestSentParams {
  requestId: bigint;
}

export interface SetUnitPoolParams {
  unitPoolID: bigint;
}
export interface SetDrawingPoolParams {
  drawingPoolID: bigint;
}

export interface RequestCompletedParams {
  requestId: bigint;
  requester: Address;
}

export interface TransferSingleParams {
    operator: Address;
    from: Address;
    to: Address;
    id: bigint;
    value: bigint;
}

export interface TransferBatchParams {
    operator: Address;
    from: Address;
    to: Address;
    ids: bigint[];
    values: bigint[];
}

export interface DrawingPoolInfo{
    enable: boolean;
    unlimited: boolean;
    units: bigint[];
    probs: bigint[];
    accumulatedProbs: bigint[];
}
