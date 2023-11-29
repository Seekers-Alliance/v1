export function formatHex(hex: string): string {
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
}

export function getSupportedChainId(): number {
  return process.env.NEXT_PUBLIC_CHAIN_ID
    ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)
    : 1;
}
