import { useAddresses } from '@/hooks/useAddresses';
import DRAWING_ABI from '@/abis/Drawing.json';
import { parseAbi } from 'viem';
export default function useDrawingConfig() {
  const { drawingAddress } = useAddresses();
  const chainId = 43113;
  return {
    address: drawingAddress,
    // abi: DRAWING_ABI,
    abi: parseAbi([
      'function setUnitPool(uint32[] memory _probs) returns(uint32)',
      'function setDrawingPool(uint32[] memory _unitIDs, uint32[] memory _probs) returns(uint32)',
      'function setTokenMaxAmount(uint32[] memory _maxAmounts)',
    ]),
    chainId: chainId,
  };
}
