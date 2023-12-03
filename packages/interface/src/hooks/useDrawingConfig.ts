import {useAddresses} from "@/hooks/useAddresses";
import DRAWING_ABI from "@/abis/Drawing.json";
export default function useDrawingConfig() {
  const {drawingAddress} = useAddresses();
  const chainId = 43113;
  return {
      address: drawingAddress,
      abi: DRAWING_ABI,
      chainId: chainId,
  }
}
