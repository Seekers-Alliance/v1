import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractRead, useContractReads, useContractWrite } from 'wagmi';
import { parseAbi } from 'viem';
import { QueryResult } from '@/types';
import DRAWING_ABI from '@/abis/Drawing.json';

export default function useDrawingRead(
  fn: string,
  args: any = [],
  watch = true
): QueryResult<DrawingRead> {
  const config = useDrawingConfig();
  const drawingConfig = {
    address: config.address,
    abi: parseAbi([
      'function ids(uint256 _index) returns (uint256)',
      'function getTokenPoolInfo() returns(uint256[] memory)',
    ]),
    // abi: DRAWING_ABI,
  };
  console.log(fn, drawingConfig, args);
  const read = useContractRead({
    // ...config,
    ...drawingConfig,
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

type DrawingRead = bigint & bigint[] & any;

function mappingResult(fn: string, result: any): DrawingRead {
  switch (fn) {
    case 'ids':
      return BigInt(result);
    case 'getTokenPoolInfo':
      return result as bigint[];
    default:
      return result;
  }
}
