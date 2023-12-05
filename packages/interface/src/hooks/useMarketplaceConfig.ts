import { useAddresses } from '@/hooks/useAddresses';
import DRAWING_ABI from '@/abis/Drawing.json';
import { parseAbi } from 'viem';
export default function useMarketplaceConfig() {
  const { marketplaceSenderAddress } = useAddresses();
    const chainId = 11155111;
  return {
    address: marketplaceSenderAddress,
    abi: parseAbi([
      'function purchasePackNative(uint64 destinationChainSelector,address messageReceiver,uint32 _packID,uint32 _packAmounts,uint8 payFeesIn) external payable',
    ]),
    chainId: chainId,
  };
}
