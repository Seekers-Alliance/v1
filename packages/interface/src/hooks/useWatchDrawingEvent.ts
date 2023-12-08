import { useCallback } from 'react';
import { parseAbi, PublicClient } from 'viem';
import useWatchEvent from '@/hooks/useWatchEvent';
import { useAddresses } from '@/hooks/useAddresses';
import { usePublicClient } from 'wagmi';

export default function useWatchDrawingEvent(
  fn: string,
  filter: (event: any) => boolean
) {
  const { drawingAddress } = useAddresses();
  const client = usePublicClient({ chainId: 43113 });
  const fetchFn = useCallback(async () => {
    const newBlockNumber = await client.getBlockNumber();
    console.log(`open page newBlockNumber`, newBlockNumber);
    const events = await client.getContractEvents({
      address: drawingAddress,
      abi: parseAbi([
        'event RequestFulfilled(uint256 indexed requestId, uint256[] randomWords)',
        'event RequestSent(uint256 requestId, address requester)',
        'event RequestCompleted(uint256 indexed requestId, address indexed requester)',
      ]),
      // @ts-ignore
      eventName: fn,
      fromBlock: newBlockNumber - BigInt(1000),
      toBlock: 'latest',
    });
    console.log(`open page events`, events);
    if (events.length === 0) {
      return null;
    }
    const filtered = events.filter(filter);
    // @ts-ignore
    const sorted = filtered.sort(
      // @ts-ignore
      (a, b) => b.blockNumber - a.blockNumber
    );
    return sorted[0];
  }, [client, drawingAddress, fn]);
  const { event, stopWatch } = useWatchEvent(fetchFn, 5);
  console.log(`watch event:`, fn, event);
  return { event, stopWatch };
}
