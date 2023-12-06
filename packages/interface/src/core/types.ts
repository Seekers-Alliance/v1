import { Address } from 'abitype';
import { Hash } from 'viem';

export interface GetEventParams<T> {
  address: Address;
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

export interface DrawingPoolInfo{
    enable: boolean;
    unlimited: boolean;
    units: bigint[];
    probs: bigint[];
    accumulatedProbs: bigint[];
}
