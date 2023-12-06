import EditPoolInput from '@/components/EditPoolInput';
import { AddCard } from '@/components/AddCard';
import { SpecificChainButton } from '@/components/Button';
import React, { useCallback, useEffect, useMemo } from 'react';
import ProbabilityInputCard from '@/components/ProbabilityInputCard';
import { useUnitPoolStore } from '@/stores/unitPool';
import { useDrawingPoolStore } from '@/stores/drawingPool';
import useTxnNotify from '@/hooks/useTxnNotify';
import { TransactionAction } from '@/components/transaction';
import useDrawingTxn from '@/hooks/useDrawingTxn';
import { filterDrawingEvents } from '@/core/events/drawing';
import { SetDrawingPoolParams } from '@/core/types';

interface SetDrawingProbabilitySectionProps {
  poolName: string;
  onLoading?: (isLoading: boolean) => void;
}

export default function SetDrawingProbabilitySection({
  poolName,
  onLoading,
}: SetDrawingProbabilitySectionProps) {
  const { getPool, add } = useDrawingPoolStore();
  const defaultPool = useMemo(() => getPool(poolName), [poolName]);
  const [poolId, setPoolId] = React.useState<bigint | null>(null);
  const { pools: unitPools,getPool:getUnitPool } = useUnitPoolStore();
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
    const unitPoolIds = unitPools.list.map((name) =>
      BigInt(getUnitPool(name)?.id || 0)
    );
    console.log('submit unitPoolIds',unitPoolIds, probabilityList)
    //@ts-ignore
    submit?.({ args: [unitPoolIds, probabilityList] });
  }, [poolId, add, probabilityList]);
  const {
    hash,
    submit,
    isSubmitError,
    isSubmitSuccess,
    submitError,
    confirmError,
    isConfirmSuccess,
    isConfirmError,
    confirmData,
    isLoading,
  } = useDrawingTxn('setDrawingPool');
  console.log(getPool(poolName));
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
      isSubmitError,
      isSubmitSuccess,
      submitError
    );
  }, [isSubmitError, isSubmitSuccess, submitError]);
  useEffect(() => {
    handleTxnResponse(
      TransactionAction.CONFIRM,
      isConfirmError,
      isConfirmSuccess,
      confirmError
    );
  }, [isConfirmError, isConfirmSuccess, confirmError]);
  useEffect(() => {
    if (confirmData) {
      const event = filterDrawingEvents('SetDrawingPool', confirmData.logs);
      console.log('confirmData', event);
      if (event) {
        add({
          id: (event.args as SetDrawingPoolParams).drawingPoolID.toString(),
          name: poolName,
          probabilities: probabilityList,
        });
      }
    }
  }, [confirmData]);
  useEffect(() => {
    onLoading?.(isLoading);
  }, [isLoading]);
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
                      if (v || v === 0) {
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
              isLoading={isLoading}
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
