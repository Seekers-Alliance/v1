import { useCallback, useMemo } from 'react';
import { parseAbi, PublicClient } from 'viem';
import useWatchEvent from '@/hooks/useWatchEvent';
import { useAddresses } from '@/hooks/useAddresses';
import { usePublicClient } from 'wagmi';

export default function useWatchMarketplaceEvent(
  fn: string,
  filter: (event: any) => boolean
) {
  const { marketplaceReceiverAddress, marketplaceSenderAddress } =
    useAddresses();
  const address = useMemo(() => {
    if (fn === 'MessageReceived') {
      return marketplaceReceiverAddress;
    } else if (fn === 'MessageSent') {
      return marketplaceSenderAddress;
    }
  }, [fn, marketplaceReceiverAddress, marketplaceSenderAddress]);
  const client = usePublicClient({ chainId: 43113 });
  const fetchFn = useCallback(async () => {
    const newBlockNumber = await client.getBlockNumber();
    console.log(`open page newBlockNumber`, newBlockNumber);
    const events = await client.getContractEvents({
      address: address,
      abi: parseAbi([
        'event MessageReceived(bytes32 indexed messageId,uint64 indexed sourceChainSelector)',
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

    const sorted = filtered.sort(
      // @ts-ignore
      (a, b) => b.blockNumber - a.blockNumber
    );
    return sorted[0];
  }, [client, address, fn]);
  const { event, stopWatch } = useWatchEvent(fetchFn, 5);
  console.log(`watch event:`, fn, event);
  return { event, stopWatch };
}
