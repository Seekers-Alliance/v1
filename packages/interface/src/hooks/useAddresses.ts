import { Address } from 'wagmi';

export interface Addresses {
  drawingAddress: Address;
  nftAddress: Address;
  vrfAddress: Address;
  vrfManagerAddress: Address;
  marketplaceSenderAddress: Address;
  marketplaceReceiverAddress: Address;
}

export function useAddresses(): Addresses {
  return {
    drawingAddress: '0xA8599c758C913d40c8368DC93890D44343b52441' as Address,
    nftAddress: '0x7B17d3d83189FFAF1Eb4F3fc9Ba00992a3c1b486' as Address,
    vrfAddress: '0x2eD832Ba664535e5886b75D64C46EB9a228C2610' as Address,
    vrfManagerAddress: '0xd3f8FFdA0fd9A2eB5D3acF7c5E9ae4334f0A2Add' as Address,
    marketplaceSenderAddress: '0x19121241f9F3Da2813b5B8C0E2Bc5aEA9Ec17aF5' as Address,
    marketplaceReceiverAddress:'0x1d163C7Fb8925a88EB0AC4042868F8248d60a107' as Address,
  };
}
