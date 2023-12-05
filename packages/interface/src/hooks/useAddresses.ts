import { Address } from 'wagmi';

export interface Addresses {
  drawingAddress: Address;
  nftAddress: Address;
  vrfAddress: Address;
  vrfManagerAddress: Address;
}

export function useAddresses(): Addresses {
  return {
    drawingAddress: '0xDFA09a9F9edEdA009578d85baFc9AD92a4597424' as Address,
    nftAddress: '0x7B17d3d83189FFAF1Eb4F3fc9Ba00992a3c1b486' as Address,
    vrfAddress: '0x2eD832Ba664535e5886b75D64C46EB9a228C2610' as Address,
    vrfManagerAddress: '0xd3f8FFdA0fd9A2eB5D3acF7c5E9ae4334f0A2Add' as Address,
  };
}
