import { useContractWrite } from 'wagmi';
import useCoinConfig from '@/hooks/useCoinConfig';
import { useMemo } from 'react';

export default function useCoinWrite(coin: string, fn: string) {
  const config = useCoinConfig();
  let abi;
  const address = useMemo(() => {
    switch (coin) {
      case 'USDT':
        return config.usdtAddress;
      default:
        return config.usdtAddress;
    }
  }, [coin]);
  return useContractWrite({
    address: address,
    //@ts-ignore
    ...config,
    //@ts-ignore
    functionName: fn,
  });
}
