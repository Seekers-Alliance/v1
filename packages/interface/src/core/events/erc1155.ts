import { decodeEventLog, Log, parseAbi } from 'viem';
import {mappingEvent} from '@/core/events/event';
import {
  EventData, RequestCompletedParams,
  SetDrawingPoolParams,
  SetUnitPoolParams, TransferBatchParams, TransferSingleParams,
} from '@/core/types';

type ERC1155Event = TransferSingleParams | TransferBatchParams;

export function filterERC1155Events(
  event: string,
  logs: Log[]
): EventData<ERC1155Event>[]{
  const abi = parseAbi([
    'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
    'event TransferBatch(address indexed operator,address indexed from,address indexed to,uint256[] ids,uint256[] values)',
  ]);
  let topic = '';
  let mapping = null;
  switch (event) {
    case 'TransferSingle':
      topic =
        '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
      mapping = mappingTransferSingleParams;
      break;
    case 'TransferBatch':
      topic =
        '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb';
      mapping = mappingTransferBatchParams;
      break;
    default:
      return [];
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
      result.push(mappingEvent({ ...e, ...eventLog }, mapping));
    }
  }
  return result;
}

export function mappingTransferSingleParams(
  a: readonly unknown[] | Record<string, unknown>
): TransferSingleParams {
  return {
    //@ts-ignore
    operator: a.operator,
    //@ts-ignore
    from: a.from,
    //@ts-ignore
    to: a.to,
    //@ts-ignore
    id: a.id,
    //@ts-ignore
    value: a.value,
  } as TransferSingleParams;
}
export function mappingTransferBatchParams(
    a: readonly unknown[] | Record<string, unknown>
): TransferBatchParams {
     return {
        //@ts-ignore
        operator: a.operator,
        //@ts-ignore
        from: a.from,
        //@ts-ignore
        to: a.to,
        //@ts-ignore
        ids: a.ids,
        //@ts-ignore
        values: a.values,
    } as TransferBatchParams;
}
