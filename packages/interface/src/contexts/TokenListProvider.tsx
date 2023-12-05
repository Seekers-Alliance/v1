'use client';
import { TokenListContext } from '@/hooks/useTokenList';
import { ReactNode, useEffect, useState } from 'react';
import useDrawingRead from '@/hooks/useDrawingRead';

interface TokenListProviderProps {
  children: ReactNode;
}

export function TokenListProvider({ children }: TokenListProviderProps) {
  const [tokenList, setTokenList] = useState<bigint[]>([]);
  const { data, isLoading, error } = useDrawingRead(
    'getTokenPoolInfo',
    [],
    false
  );
  useEffect(() => {
    if (data) {
      setTokenList(data as bigint[]);
    }
  }, []);
  return (
    <TokenListContext.Provider
      value={{
        tokenList,
      }}
    >
      {children}
    </TokenListContext.Provider>
  );
}
