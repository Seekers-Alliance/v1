import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractRead, useContractReads, useContractWrite } from 'wagmi';
import { parseAbi } from 'viem';
import { QueryResult } from '@/types';
import DRAWING_ABI from '@/abis/Drawing.json';
import { DrawingPoolInfo } from '@/core/types';
import useMarketplaceConfig from '@/hooks/useMarketplaceConfig';

export default function useMarketplaceRead(
  fn: string,
  args: any = [],
  chainId: number,
  watch = true
): QueryResult<DrawingRead> {
  const config = useMarketplaceConfig();
  let address;
  switch (chainId) {
    case 43113:
      address = config.receiver;
      break;
    case 11155111:
      address = config.sender;
      break;
    default:
      address = config.receiver;
  }
  const marketplaceConfig = {
    address: address,
    abi: parseAbi([
      'function getPackConvertedNativePrice(uint32 _packID) public view returns(uint256)',
    ]),
    chainId: chainId,
  };
  console.log(fn, marketplaceConfig, args);
  const read = useContractRead({
    // ...config,
    ...marketplaceConfig,
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

type DrawingRead = bigint & any;

function mappingResult(fn: string, result: any): DrawingRead {
  switch (fn) {
    case 'getPackConvertedNativePrice':
      return BigInt(result);
    default:
      return result;
  }
}
