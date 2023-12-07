import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractRead, useContractReads, useContractWrite } from 'wagmi';
import { parseAbi } from 'viem';
import { QueryResult } from '@/types';
import DRAWING_ABI from '@/abis/Drawing.json';
import { DrawingPoolInfo } from '@/core/types';
import useMarketplaceConfig from '@/hooks/useMarketplaceConfig';

export default function usePackPrice(
  packId: number,
  chainId: number
): QueryResult<PackPrice> {
  const config = useMarketplaceConfig();
  let address;
  let usdtAddress;
  let multiCallAddress;
  switch (chainId) {
    case 43113:
      address = config.receiver;
      usdtAddress = '0xae940284e4eB37Fec1F1Bf1D7f297EB1f07f2B26';
      multiCallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11';
      break;
    case 11155111:
      address = config.sender;
      usdtAddress = '0x4E85938b8cba54F4726A649b727c15Cca379b146';
      multiCallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11';
      break;
    default:
      address = config.sender;
      usdtAddress = '0x4E85938b8cba54F4726A649b727c15Cca379b146';
      multiCallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11';
      chainId = 11155111;
  }
  const marketplaceConfig = {
    address: address,
    abi: parseAbi([
      'function getPackConvertedPrice(uint32 _packID, address _token) public view returns(uint256)',
      'function getPackConvertedNativePrice(uint32 _packID) public view returns(uint256)',
    ]),
    chainId: chainId,
  };
  const contracts = [
    {
      ...marketplaceConfig,
      functionName: 'getPackConvertedNativePrice',
      args: [packId],
      chainId: chainId,
    },
    {
      ...marketplaceConfig,
      functionName: 'getPackConvertedPrice',
      args: [packId, usdtAddress],
      chainId: chainId,
    },
  ];
  const reads = useContractReads({
    multicallAddress: multiCallAddress as `0x${string}`,
    contracts,
    watch: true,
  });
  console.log(reads);
  if (!reads.data) {
    return { ...reads, data: null };
  }

  return {
    ...reads,
    data: {
      //@ts-ignore
      native: BigInt(reads.data[0].result || 0),
      //@ts-ignore
      usdt: BigInt(reads.data[1].result || 0),
    },
  };
}

interface PackPrice {
  native: bigint;
  usdt: bigint;
}
