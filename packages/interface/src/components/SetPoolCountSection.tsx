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
import { useWaitForTransaction } from 'wagmi';

export default function SetPoolCountSection() {
  const defaultCountList = useMemo(
    () => Array.from({ length: TOKEN_LIST.length }, () => BigInt(0)),
    []
  );
  const [countList, setCountList] = React.useState<bigint[]>(defaultCountList);
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
  return (
    <>
      {contextHolder}
      <div>
        <div className='flex flex-col gap-4'>
          <div className='grid grid-flow-dense grid-cols-8 gap-2'>
            <div className='h-[220px] w-[110px]'>
              <AddCard>Add NFT</AddCard>
            </div>
            {TOKEN_LIST.map((item, index) => {
              return (
                <div className='h-[220px] w-[110px]' key={index}>
                  <CountInputCard
                    defaultValue={countList[index].toString()}
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
