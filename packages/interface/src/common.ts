import BigNumber from 'bignumber.js';

export function formatHex(hex: string): string {
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
}

export function getSupportedChainId(): number {
  return process.env.NEXT_PUBLIC_CHAIN_ID
    ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)
    : 1;
}

export function formatAmount(
  num: bigint | null | undefined,
  decimals: number,
  precision = 2
): string {
  if (!num) {
    return '0';
  }
  const divisor = BigNumber(10).pow(decimals);
  const amount = BigNumber(num.toString()).div(divisor);
  return amount.toFixed(precision);
}
