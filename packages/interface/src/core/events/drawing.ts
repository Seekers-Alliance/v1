import { decodeEventLog, Log, parseAbi } from 'viem';
import { mappingEvent } from '@/core/events/event';
import {
  EventData,
  RequestCompletedParams,
  RequestSentParams,
  SetDrawingPoolParams,
  SetUnitPoolParams,
} from '@/core/types';

type DrawingEvent =
  | SetUnitPoolParams
  | SetDrawingPoolParams
  | RequestCompletedParams
  | RequestSentParams;

export function filterDrawingEvents(
  event: string,
  logs: Log[]
): EventData<DrawingEvent> | null {
  const abi = parseAbi([
    'event RequestSent(uint256 requestId, address requester)',
    'event SetUnitPool(uint32 unitPoolID)',
    'event SetDrawingPool(uint32 drawingPoolID)',
    'event RequestCompleted(uint256 indexed requestId, address indexed requester)',
  ]);
  let topic = '';
  let mapping = null;
  switch (event) {
    case 'RequestSent':
      topic =
        '0x48b98ad7a8a8dbe21cc82bf98710ad4d2cdd949ccac393692e4d9a1722c162c7';
      mapping = mappingRequestSentParams;
      break;
    case 'SetUnitPool':
      topic =
        '0xccfa93fc6dee2f7a59e08bd1a7bce043edec08ba7a9daa51aa4be9c95294acd6';
      mapping = mappingSetUnitPoolParams;
      break;
    case 'SetDrawingPool':
      topic =
        '0x83b611e3a9f3ebea1fa1254d2c7535bd0733ed9b76a5a2b0da450d5ba399ecbd';
      mapping = mappingSetDrawingPoolParams;
      break;
    case 'RequestCompleted':
      topic =
        '0x83b611e3a9f3ebea1fa1254d2c7535bd0733ed9b76a5a2b0da450d5ba399ecbd';
      mapping = mappingRequestCompletedParams;
      break;
    default:
      return null;
  }
  for (const e of logs) {
    const eventTopic = e.topics[0];
    if (!eventTopic) continue;
    if (eventTopic.toLowerCase() === topic.toLowerCase()) {
      const eventLog = decodeEventLog({
        abi: abi,
        data: e.data,
        topics: e.topics,
      });
      //@ts-ignore
      return mappingEvent({ ...e, ...eventLog }, mapping);
    }
  }
  return null;
}

export function mappingSetUnitPoolParams(
  a: readonly unknown[] | Record<string, unknown>
): SetUnitPoolParams {
  return {
    //@ts-ignore
    unitPoolID: a.unitPoolID,
  } as SetUnitPoolParams;
}

export function mappingSetDrawingPoolParams(
  a: readonly unknown[] | Record<string, unknown>
): SetDrawingPoolParams {
  return {
    //@ts-ignore
    drawingPoolID: a.drawingPoolID,
  } as SetDrawingPoolParams;
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

export function mappingRequestSentParams(
  a: readonly unknown[] | Record<string, unknown>
): RequestSentParams {
  return {
    //@ts-ignore
    requestId: a.requestId,
    //@ts-ignore
    requester: a.requester,
  } as RequestSentParams;
}
