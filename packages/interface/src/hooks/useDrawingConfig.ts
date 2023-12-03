import {useAddresses} from "@/hooks/useAddresses";
import DRAWING_ABI from "@/abis/Drawing.json";
export default function useDrawingConfig() {
  const {drawingAddress} = useAddresses();
  return {
      address: drawingAddress,
      abi: DRAWING_ABI,
  }
}
