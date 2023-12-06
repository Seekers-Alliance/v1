import EditPoolInput from '@/components/EditPoolInput';
import { AddCard } from '@/components/AddCard';
import { SpecificChainButton } from '@/components/Button';
import React, { useCallback, useEffect, useMemo } from 'react';
import ProbabilityInputCard from '@/components/ProbabilityInputCard';
import { useUnitPoolStore } from '@/stores/unitPool';
import { TransactionAction } from '@/components/transaction';
import useTxnNotify from '@/hooks/useTxnNotify';
import { NFTProfile } from '@/components/NFTProfile';
import useDrawingTxn from '@/hooks/useDrawingTxn';
import { useTokenList } from '@/hooks/useTokenList';
import { filterDrawingEvents } from '@/core/events/drawing';
import { SetUnitPoolParams } from '@/core/types';

interface SetUnitProbabilitySectionProps {
  poolName: string;
  onLoading?: (isLoading: boolean) => void;
}

export default function SetUnitProbabilitySection({
  onLoading,
  poolName,
}: SetUnitProbabilitySectionProps) {
  const { tokenList } = useTokenList();
  const { getPool, add } = useUnitPoolStore();
  const defaultPool = useMemo(() => getPool(poolName), [poolName]);
  const [poolId, setPoolId] = React.useState<bigint | null>(null);

  const defaultProbabilityList = useMemo(
    () => defaultPool?.probabilities || [],
    [defaultPool]
  );
  const [probabilityList, setProbabilityList] = React.useState<number[]>(
    defaultProbabilityList
  );
  const { handleTxnResponse, api, contextHolder } = useTxnNotify();
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
  } = useDrawingTxn('setUnitPool');
  console.log(getPool(poolName));
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
    submit?.({ args: [probabilityList] });
  }, [poolName, add, probabilityList]);
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
      const event = filterDrawingEvents('SetUnitPool', confirmData.logs);
      console.log('confirmData', event);
      if (event) {
        add({
          id: (event.args as SetUnitPoolParams).unitPoolID.toString(),
          name: poolName,
          probabilities: probabilityList,
        });
      }
    }
  }, [confirmData]);

  useEffect(() => {
    if (tokenList && probabilityList.length === 0) {
      setProbabilityList(
        (tokenList as bigint[]).map((i) => {
          return 0;
        })
      );
    }
  }, [tokenList, probabilityList]);
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
            <div className='h-[220px] w-[110px]'>
              <AddCard>Add Card</AddCard>
            </div>
            {tokenList.map((item, index) => {
              return (
                <div className='h-52 w-[110px]' key={index}>
                  <ProbabilityInputCard
                    defaultValue={defaultProbabilityList[index]}
                    onChange={(v) => {
                      if (v || v === 0) {
                        console.log(v);
                        handleUpdateProbability(index, Number(v));
                      }
                    }}
                  >
                    <NFTProfile tokenId={item} />
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
