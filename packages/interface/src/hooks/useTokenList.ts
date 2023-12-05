import useDrawingRead from '@/hooks/useDrawingRead';
import { createContext, useContext } from 'react';

export interface TokenListContextState {
  tokenList: bigint[];
}

export const TokenListContext = createContext({} as TokenListContextState);

export function useTokenList() {
  return useContext(TokenListContext);
}
