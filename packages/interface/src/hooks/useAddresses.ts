import { Address, useNetwork } from 'wagmi';

export interface Addresses {
  fomoAddress: Address;
  nftAddress: Address;
  vrfAddress: Address;
  vrfSubscriptionManagerAddress: Address;
}

export function useAddresses(): Addresses {
  const { chain } = useNetwork();
  if (!chain) return ADDRESSES['Avalanche Fuji'];
  switch (chain?.name) {
    case 'Avalanche Fuji':
      console.log('Avalanche Fuji!!!!');
      return ADDRESSES['Avalanche Fuji'];
    default:
      return ADDRESSES['Avalanche Fuji'];
  }
}

const ADDRESSES = {
  'Avalanche Fuji': {
    fomoAddress: '0xa3d1474369Da3732961CaFBe38Bde8b6ef8AA900' as Address,
    nftAddress: '0x7B17d3d83189FFAF1Eb4F3fc9Ba00992a3c1b486' as Address,
    vrfAddress: '0x2eD832Ba664535e5886b75D64C46EB9a228C2610' as Address,
    vrfSubscriptionManagerAddress:
      '0xd3f8FFdA0fd9A2eB5D3acF7c5E9ae4334f0A2Add' as Address,
  },
};
