import { useContractWrite } from 'wagmi';
import useMarketplaceConfig from '@/hooks/useMarketplaceConfig';

export default function useMarketplaceWrite(fn: string, chainId: number) {
  const config = useMarketplaceConfig();
  let address;
  let abi;
  switch (chainId) {
    case 43113:
      address = config.receiver;
      abi = config.receiverAbi;
      break;
    case 11155111:
      address = config.sender;
      abi = config.senderAbi;
      break;
    default:
      address = config.receiver;
      abi = config.receiverAbi;
  }
  return useContractWrite({
    address: address,
    //@ts-ignore
    abi: abi,
    chainId: chainId,
    //@ts-ignore
    functionName: fn,
  });
}
