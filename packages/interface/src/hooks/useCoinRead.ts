import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractRead, useContractReads, useContractWrite } from 'wagmi';
import { parseAbi } from 'viem';
import { QueryResult } from '@/types';
import DRAWING_ABI from '@/abis/Drawing.json';
import { DrawingPoolInfo } from '@/core/types';
import useCoinConfig from '@/hooks/useCoinConfig';
import { useMemo } from 'react';

export default function useCoinRead(
  coin: string,
  fn: string,
  args: any = [],
  watch = true
): QueryResult<CoinRead> {
  const config = useCoinConfig();
  const address = useMemo(() => {
    switch (coin) {
      case 'USDT':
        return config.usdtAddress;
      default:
        return config.usdtAddress;
    }
  }, [coin]);
  const coinConfig = {
    address: address,
    ...config,
  };
  console.log(fn, coinConfig, args);
  const read = useContractRead({
    // ...config,
    ...coinConfig,
    // @ts-ignore
    functionName: fn,
    args: args,
    watch: watch,
  });
  console.log(read);
  if (!read.data) {
    return { ...read, data: null };
  }

  return {
    ...read,
    data: mappingResult(fn, read.data),
  };
}

type CoinRead = bigint & bigint[] & Number & any;

function mappingResult(fn: string, result: any): CoinRead {
  switch (fn) {
    case 'allowance':
      return BigInt(result);
    default:
      return result;
  }
}
