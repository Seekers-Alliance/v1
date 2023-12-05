import EditPoolInput from '@/components/EditPoolInput';
import { AddCard } from '@/components/AddCard';
import { SpecificChainButton } from '@/components/Button';
import React, { useCallback, useEffect, useMemo } from 'react';
import ProbabilityInputCard from '@/components/ProbabilityInputCard';
import { TOKEN_LIST } from '@/types';
import { useUnitPoolStore } from '@/stores/unitPool';
import { TransactionAction } from '@/components/transaction';
import useTxnNotify from '@/hooks/useTxnNotify';
import NFTProfile from '@/components/NFTProfile';
import useDrawingTxn from '@/hooks/useDrawingTxn';
import CountInputCard from '@/components/CountInputCard';
import useDrawingWrite from '@/hooks/useDrawingWrite';
import { useContractReads, useWaitForTransaction } from 'wagmi';
import useDrawingRead from '@/hooks/useDrawingRead';
import { useTokenList } from '@/hooks/useTokenList';

export default function SetPoolCountSection() {
  const { tokenList } = useTokenList();
  const [countList, setCountList] = React.useState<bigint[]>([]);
  const { handleTxnResponse, contextHolder, api } = useTxnNotify();
  const handleUpdateCount = useCallback(
    (index: number, value: string) => {
      try {
        const v = BigInt(value);
        if (v > MAX_UINT32) {
          throw new Error('value too large');
        }
        countList[index] = v;
        setCountList(countList);
      } catch (e) {
        console.log(e);
        api.error({
          message: 'Error',
          description: 'value invalid: v, Error: ' + e,
        });
      }
    },
    [countList]
  );
  const handleSetCount = useCallback(() => {
    console.log('setCount');

    // setDrawing({
    //   args: [0, probabilityList],
    // });
    // console.log(probabilityList);
  }, []);

  useEffect(() => {
    if (tokenList) {
      setCountList(
        (tokenList as bigint[]).map((i) => {
          return BigInt(0);
        })
      );
    }
  }, []);
  return (
    <>
      {contextHolder}
      <div>
        <div className='flex flex-col gap-4'>
          <div className='grid grid-flow-dense grid-cols-8 gap-2'>
            <div className='h-[220px] w-[110px]'>
              <AddCard>Add NFT</AddCard>
            </div>
            {tokenList.map((item, index) => {
              return (
                <div className='h-[220px] w-[110px]' key={index}>
                  <CountInputCard
                    defaultValue={'0'}
                    onChange={(v) => {
                      if (v && v !== '') {
                        console.log(v);
                        handleUpdateCount(index, v);
                      }
                    }}
                  >
                    <NFTProfile tokenId={item} />
                  </CountInputCard>
                </div>
              );
            })}
          </div>
          <div className='w-[300px]'>
            <SpecificChainButton chainId={43113} onClick={handleSetCount}>
              Set Mint Caps
            </SpecificChainButton>
          </div>
        </div>
      </div>
    </>
  );
}

const MAX_UINT32 = BigInt('4294967295');
