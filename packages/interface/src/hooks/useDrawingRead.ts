import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractRead, useContractReads, useContractWrite } from 'wagmi';
import { parseAbi } from 'viem';
import { QueryResult } from '@/types';
import DRAWING_ABI from '@/abis/Drawing.json';

export default function useDrawingRead(
  fn: string,
  args: any
): QueryResult<DrawingRead> {
  const config = useDrawingConfig();
  const drawingConfig = {
    address: config.address,
    // abi:parseAbi([
    //     'function ids(uint256 _index) returns (uint256)',
    // ]),
    abi: DRAWING_ABI,
  };
  console.log(args);
  const read = useContractRead({
    ...config,
    functionName: fn,
    args: args,
    chainId: config.chainId,
    watch: true,
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

type DrawingRead = BigInt & any;

function mappingResult(fn: string, result: any): DrawingRead {
  switch (fn) {
    case 'ids':
      return BigInt(result);
    default:
      return result;
  }
}
