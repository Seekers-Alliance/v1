import useDrawingConfig from '@/hooks/useDrawingConfig';
import { useContractWrite } from 'wagmi';

export default function useDrawingWrite(fn: string) {
  const config = useDrawingConfig();
  return useContractWrite({
    ...config,
    functionName: fn,
  });
}
