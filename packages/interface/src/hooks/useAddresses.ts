import { Address } from 'wagmi';
import { getConfig } from '@/config';

export interface Addresses {
  drawingAddress: Address;
  nftAddress: Address;
  vrfAddress: Address;
  vrfManagerAddress: Address;
  marketplaceSenderAddress: Address;
  marketplaceReceiverAddress: Address;
}

export function useAddresses(): Addresses {
  const config = getConfig();
  return {
    drawingAddress: config.drawingAddress as Address,
    nftAddress: config.nftAddress as Address,
    vrfAddress: config.vrfAddress as Address,
    vrfManagerAddress: config.vrfManagerAddress as Address,
    marketplaceSenderAddress: config.marketplaceSenderAddress as Address,
    marketplaceReceiverAddress: config.marketplaceReceiverAddress as Address,
  };
}
