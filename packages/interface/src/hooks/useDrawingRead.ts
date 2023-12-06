import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractRead, useContractReads, useContractWrite } from 'wagmi';
import { parseAbi } from 'viem';
import { QueryResult } from '@/types';
import DRAWING_ABI from '@/abis/Drawing.json';
import {DrawingPoolInfo} from "@/core/types";

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
        'function usersDrawable(address user, uint32 poolId) returns(uint32)',
        // 'function drawingPoolsInfo(uint32 poolId) returns((bool, bool, uint32[], uint32[], uint32[]))',
      'function getPoolInfo(uint32 poolId) returns((uint32[3], uint32[3], uint32[3]))'
    ]),
    // abi: DRAWING_ABI,
  };
  console.log(fn, drawingConfig, args);
  const read = useContractRead({
    // ...config,
    ...drawingConfig,
    // @ts-ignore
    functionName: fn,
    chainId:43113,
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

type DrawingRead = bigint & bigint[] & Number & DrawingPoolInfo & any;

function mappingResult(fn: string, result: any): DrawingRead {
  switch (fn) {
    case 'ids':
      return BigInt(result);
    case 'getTokenPoolInfo':
      return result as bigint[];
    case 'usersDrawable':
        return Number(result)
    case 'getPoolInfo':
        return {
            units: result[0] as bigint[],
            probs: result[1] as bigint[],
            accumulatedProbs: result[2] as bigint[],
        }
    default:
      return result;
  }
}
