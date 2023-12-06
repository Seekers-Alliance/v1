import { decodeEventLog, Log, parseAbi } from 'viem';
import { mappingEvent } from '@/core/events/event';
import {
  EventData,
  MessageReceivedParams,
  MessageSentParams,
  RequestCompletedParams,
  SetDrawingPoolParams,
  SetUnitPoolParams,
  TransferBatchParams,
  TransferSingleParams,
} from '@/core/types';

type MarketplaceEvent = MessageSentParams | MessageReceivedParams;

export function filterMarketplaceEvents(
  event: string,
  logs: Log[]
): EventData<MarketplaceEvent> | null {
  const abi = parseAbi([
    'event MessageSent(bytes32 indexed messageId,uint64 indexed destinationChainSelector,address indexed messageSender)',
    'event MessageReceived(bytes32 indexed messageId,uint64 indexed sourceChainSelector)',
  ]);
  let topic = '';
  let mapping = null;
  switch (event) {
    case 'MessageSent':
      topic =
        '0xd6b7de0a75c28230ed0cecf9a5f80bfd2c81047a14fc87f1b1203d7491c11e23';
      mapping = mappingMessageSentParams;
      break;
    case 'MessageReceived':
      topic =
        '0x556d717a59d7ef2969f5a9f2c6f9199f9a4e78cb7704aa4162ee70f7d2b771f1';
      mapping = mappingMessageReceivedParams;
      break;
    default:
      return null;
  }
  const result = [];
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

export function mappingMessageSentParams(
  a: readonly unknown[] | Record<string, unknown>
): MessageSentParams {
  return {
    //@ts-ignore
    messageId: a.messageId,
    //@ts-ignore
    destinationChainSelector: a.destinationChainSelector,
    //@ts-ignore
    messageSender: a.messageSender,
  } as MessageSentParams;
}
export function mappingMessageReceivedParams(
  a: readonly unknown[] | Record<string, unknown>
): MessageReceivedParams {
  return {
    //@ts-ignore
    messageId: a.messageId,
    //@ts-ignore
    sourceChainSelector: a.sourceChainSelector,
  } as MessageReceivedParams;
}
