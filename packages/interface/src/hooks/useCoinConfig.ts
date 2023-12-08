import { useAddresses } from '@/hooks/useAddresses';
import { parseAbi } from 'viem';
import { useNetwork } from 'wagmi';
import { useMemo } from 'react';
export default function useCoinConfig() {
  const { avaxUsdtAddress, ethUsdtAddress } = useAddresses();
  const { chain } = useNetwork();
  const usdtAddress = useMemo(() => {
    switch (chain?.id || 43113) {
      case 43113:
        return avaxUsdtAddress;
      case 11155111:
        return ethUsdtAddress;
      default:
        return avaxUsdtAddress;
    }
  }, [chain]);
  return {
    usdtAddress: usdtAddress,
    abi: parseAbi([
      'function allowance(address owner, address spender) returns (uint256)',
      'function approve(address spender, uint256 value) returns (bool)',
    ]),
  };
}
