import { useAddresses } from '@/hooks/useAddresses';
import DRAWING_ABI from '@/abis/Drawing.json';
import { parseAbi } from 'viem';
export default function useMarketplaceConfig() {
  const { marketplaceSenderAddress, marketplaceReceiverAddress } =
    useAddresses();
  return {
    sender: marketplaceSenderAddress,
    receiver: marketplaceReceiverAddress,
    senderAbi: parseAbi([
      'function purchasePackNative(uint64 destinationChainSelector,address messageReceiver,uint32 _packID,uint32 _packAmounts,uint8 payFeesIn) external payable',
    ]),
    receiverAbi: parseAbi([
      'function purchasePackNative(uint32 _packID,uint32 _packAmounts) external payable',
    ]),
  };
}
