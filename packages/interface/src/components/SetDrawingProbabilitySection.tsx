import EditPoolInput from '@/components/EditPoolInput';
import { AddCard } from '@/components/AddCard';
import { SpecificChainButton } from '@/components/Button';
import React, { useCallback, useEffect, useMemo } from 'react';
import ProbabilityInputCard from '@/components/ProbabilityInputCard';
import { useUnitPoolStore } from '@/stores/unitPool';
import { useDrawingPoolStore } from '@/stores/drawingPool';
import useDrawingWrite from '@/hooks/useDrawingWrite';
import useTxnNotify from '@/hooks/useTxnNotify';
import { TransactionAction } from '@/components/transaction';
import { useWaitForTransaction } from 'wagmi';

interface SetDrawingProbabilitySectionProps {
  // TODO: fake index to be replaced
  index: number;
  poolName: string;
}

export default function SetDrawingProbabilitySection({
  index,
  poolName,
}: SetDrawingProbabilitySectionProps) {
  const { getPool, add } = useDrawingPoolStore();
  const defaultPool = useMemo(() => getPool(poolName), [poolName]);
  const [poolId, setPoolId] = React.useState<bigint | null>(null);
  const { pools: unitPools } = useUnitPoolStore();
  const poolProbabilityList = useMemo(
    () =>
      defaultPool?.probabilities ||
      Array.from({ length: unitPools.list.length }, () => 0),
    [unitPools.list.length]
  );
  const [probabilityList, setProbabilityList] =
    React.useState<number[]>(poolProbabilityList);
  const { handleTxnResponse, contextHolder, api } = useTxnNotify();
  const handleSetProbabilities = useCallback(() => {
    console.log('setProbabilities');
    const total = probabilityList.reduce((a, b) => a + b, 0);
    if (total !== 100) {
      api.error({
        message: 'Error',
        description: 'The sum of probabilities must be 100',
      });
      return;
    }
    add({
      id: index.toString(),
      name: poolName,
      probabilities: probabilityList,
    });
    // setDrawing({
    //   args: [0, probabilityList],
    // });
    // console.log(probabilityList);
  }, [poolId, add, probabilityList]);
  const {
    data: setDrawingData,
    write: setDrawing,
    isError: isSetDrawingError,
    isSuccess: isSetDrawingSuccess,
    error: setDrawingError,
  } = useDrawingWrite('setDrawing');
  const {
    isError: isSetDrawingTxnError,
    error: setDrawingTxnError,
    isSuccess: isSetDrawingTxnSuccess,
  } = useWaitForTransaction({
    hash: setDrawingData?.hash,
    chainId: 43113,
  });
  const handleUpdateProbability = useCallback(
    (index: number, value: number) => {
      probabilityList[index] = value;
      setProbabilityList(probabilityList);
    },
    [probabilityList]
  );
  useEffect(() => {
    handleTxnResponse(
      TransactionAction.SUBMIT,
      isSetDrawingError,
      isSetDrawingSuccess,
      setDrawingError
    );
  }, [isSetDrawingError, isSetDrawingSuccess, setDrawingError]);
  useEffect(() => {
    handleTxnResponse(
      TransactionAction.CONFIRM,
      isSetDrawingError,
      isSetDrawingSuccess,
      setDrawingError
    );
  }, [
    isSetDrawingTxnError,
    isSetDrawingTxnSuccess,
    setDrawingTxnError,
    poolId,
    probabilityList,
  ]);

  // useEffect(() => {
  //   if (isSetDrawingTxnSuccess) {
  //     add({
  //       name: poolId,
  //       probabilities: probabilityList,
  //     });
  //   }
  // }, [isSetDrawingTxnSuccess]);
  return (
    <>
      {contextHolder}
      <div>
        <div className='flex flex-col gap-4'>
          <div className='w-[300px]'>
            <EditPoolInput>{poolName}</EditPoolInput>
          </div>
          <div className='grid grid-flow-dense grid-cols-8 gap-2'>
            <div className='h-[122px] w-[110px]'>
              <AddCard>Add Unit</AddCard>
            </div>
            {unitPools.list.map((name, index) => {
              return (
                <div className='w-[110px]' key={index}>
                  <ProbabilityInputCard
                    defaultValue={poolProbabilityList[index]}
                    onChange={(v) => {
                      if (v) {
                        console.log(v);
                        handleUpdateProbability(index, Number(v));
                      }
                    }}
                  >
                    <div className='mt-1 flex h-[76px] w-[100%] items-center px-2'>
                      <div className="font-['Source Sans Pro'] text-[14px] text-white">
                        {name}
                      </div>
                    </div>
                  </ProbabilityInputCard>
                </div>
              );
            })}
          </div>
          <div className='w-[300px]'>
            <SpecificChainButton
              chainId={43113}
              onClick={handleSetProbabilities}
            >
              Set Probabilities
            </SpecificChainButton>
          </div>
        </div>
      </div>
    </>
  );
}
