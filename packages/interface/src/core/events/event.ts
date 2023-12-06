import { decodeEventLog, parseAbi, PublicClient } from 'viem';
import VRFCOORDINATOR_V2_ABI from '@/abis/VRFCoordinatorV2.json';
import VRF_MANAGER_ABI from '@/abis/VRFManager.json';
import DRAWING_ABI from '@/abis/Drawing.json';
import { Address } from 'abitype';
import { Hash, Log } from 'viem';
import {
  EventData,
  GetEventParams,
  RandomWordsFulfilledParams,
  RequestCompletedParams,
  RequestSentParams,
} from '@/core/types';


export async function getEvent<A,T>(
    client: PublicClient,
    params: GetEventParams<A>,
    mapper: (a: readonly unknown[] | Record<string, unknown>) => T
    ): Promise<EventData<T>[]> {
  console.log('params',params);
  console.log(await client.getChainId())
    const config = {
        address: params.address,
        abi: params.abi,
        eventName: params.eventName,
        args: params.args,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
    };
    //@ts-ignore
    const event = await client.getContractEvents({ ...config });
    console.log('event',event)
    return event.map((e) => mappingEvent(e, mapper));
}

export async function getRandomWordsFulfilledEventsByRequestIds(
  client: PublicClient,
  params: GetEventParams<{ requestId: bigint[] }>
): Promise<EventData<RandomWordsFulfilledParams>[]> {
  const config = {
    address: params.address,
    abi: VRFCOORDINATOR_V2_ABI,
    eventName: 'RandomWordsFulfilled',
    args: params.args,
    fromBlock: params.fromBlock,
    toBlock: params.toBlock,
  };

  const event = await client.getContractEvents({ ...config });
  return event.map((e) => mappingEvent(e, mappingRandomWordsFulfilledParams));
}

export function watchRandomWordsFulfilledEventsByRequestIds(
  client: PublicClient,
  vrfCoordinatorAddress: Address,
  requestIds: bigint[],
  listener: (e: EventData<RandomWordsFulfilledParams>) => void
) {
  const config = {
    address: vrfCoordinatorAddress,
    abi: VRFCOORDINATOR_V2_ABI,
    eventName: 'RandomWordsFulfilled',
    args: {
      requestId: requestIds,
    },
  };
  const rawListener = (logs: Log[]) => {
    for (const e of logs) {
      listener(mappingEvent(e, mappingRandomWordsFulfilledParams));
    }
  };

  return client.watchContractEvent({ ...config, onLogs: rawListener });
}

export async function getRequestCompletedEventsByRequestIds(
  client: PublicClient,
  params: GetEventParams<{ requestId: bigint[] }>
): Promise<EventData<RequestCompletedParams>[]> {
  const config = {
    address: params.address,
    abi: DRAWING_ABI,
    eventName: 'RequestCompleted',
    args: params.args,
    fromBlock: params.fromBlock,
    toBlock: params.toBlock,
  };
  const event = await client.getContractEvents({ ...config });
  return event
    .map((e) => mappingEvent(e, mappingRequestCompletedParams))
    .filter((e) => params.args.requestId.includes(e.args.requestId));
}

export function watchRequestCompletedEventsByRequestIds(
  client: PublicClient,
  fomoAddress: Address,
  requestIds: bigint[],
  listener: (e: EventData<RequestCompletedParams>) => void
) {
  const config = {
    address: fomoAddress,
    abi: DRAWING_ABI,
    eventName: 'RequestCompleted',
    args: {
      requestId: requestIds,
    },
  };
  const rawListener = (logs: Log[]) => {
    for (const e of logs) {
      listener(mappingEvent(e, mappingRequestCompletedParams));
    }
  };

  return client.watchContractEvent({ ...config, onLogs: rawListener });
}

// export async function getRequestSentEventByTxnHash(
//   client: PublicClient,
//   hash: Hash
// ): Promise<EventData<RequestSentParams> | null> {
//   const receipt = await client.getTransactionReceipt({ hash });
//   return filterRequestSentEvents(receipt.logs);
// }
//
// export async function waitRequestSentEventByTxnHash(
//   client: PublicClient,
//   hash: Hash
// ) {
//   const receipt = await client.waitForTransactionReceipt({ hash });
//   return filterRequestSentEvents(receipt.logs);
// }

export function filterRequestSentEvents(
  logs: Log[]
): EventData<RequestSentParams> | null {
  for (const e of logs) {
    const eventTopic = e.topics[0];
    if (!eventTopic) continue;
    if (eventTopic.toLowerCase() === REQUEST_SENT_TOPIC.toLowerCase()) {
      const eventLog = decodeEventLog({
        abi: VRF_MANAGER_ABI,
        data: e.data,
        topics: e.topics,
      });

      return mappingEvent({ ...e, ...eventLog }, mappingRequestSentParams);
    }
  }
  return null;
}

export function mappingEvent<T>(
  e: Log,
  argsMapper: (a: readonly unknown[] | Record<string, unknown>) => T
): EventData<T> {
  return {
    address: e.address as Address,
    blockHash: e.blockHash as Hash,
    blockNumber: e.blockNumber as bigint,
    logIndex: e.logIndex as number,
    transactionHash: e.transactionHash as Hash,
    //@ts-ignore
    args: argsMapper(e.args),
  };
}

export function mappingRandomWordsFulfilledParams(
  a: readonly unknown[] | Record<string, unknown>
): RandomWordsFulfilledParams {
  return {
    //@ts-ignore
    requestId: a.requestId,
    //@ts-ignore
    outputSeed: a.outputSeed,
    //@ts-ignore
    payment: a.payment,
    //@ts-ignore
    success: a.success,
  } as RandomWordsFulfilledParams;
}
export function mappingRequestSentParams(
  a: readonly unknown[] | Record<string, unknown>
): RequestSentParams {
  return {
    //@ts-ignore
    requestId: a.requestId,
  } as RequestSentParams;
}

export function mappingRequestCompletedParams(
  a: readonly unknown[] | Record<string, unknown>
): RequestCompletedParams {
  return {
    //@ts-ignore
    requestId: a.requestId,
    //@ts-ignore
    requester: a.requester,
  } as RequestCompletedParams;
}

const REQUEST_SENT_TOPIC =
  '0x48b98ad7a8a8dbe21cc82bf98710ad4d2cdd949ccac393692e4d9a1722c162c7';
