import { useContractWrite } from 'wagmi';
import useMarketplaceConfig from "@/hooks/useMarketplaceConfig";

export default function useMarketplaceWrite(fn: string,chainId:number) {
  const config = useMarketplaceConfig();
  return useContractWrite({
    ...config,
    chainId: chainId,
    //@ts-ignore
    functionName: fn,
  });
}
