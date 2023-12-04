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

interface SetUnitProbabilitySectionProps {
  poolName: string;
}

export default function SetUnitProbabilitySection({
  poolName,
}: SetUnitProbabilitySectionProps) {
  const { getPool, add } = useUnitPoolStore();
  const poolProbabilityList = useMemo(
    () =>
      getPool(poolName)?.probabilities ||
      Array.from({ length: TOKEN_LIST.length }, () => 0),
    [poolName]
  );
  const [probabilityList, setProbabilityList] =
    React.useState<number[]>(poolProbabilityList);
  const { handleTxnResponse, contextHolder } = useTxnNotify();
  const {
    hash,
    submit,
    isSubmitError,
    isSubmitSuccess,
    submitError,
    confirmError,
    isConfirmSuccess,
    isConfirmError,
  } = useDrawingTxn('setAtomic');
  console.log(getPool(poolName));
  const handleSetProbabilities = useCallback(() => {
    console.log('setProbabilities');
    // add({
    //   name: poolName,
    //   probabilities: probabilityList,
    // });
    submit?.({ args: [1, probabilityList] });
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
    if (isConfirmSuccess) {
      add({
        name: poolName,
        probabilities: probabilityList,
      });
    }
  }, [isConfirmSuccess]);
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
            {TOKEN_LIST.map((item, index) => {
              return (
                <div className='h-52 w-[110px]' key={index}>
                  <ProbabilityInputCard
                    defaultValue={poolProbabilityList[index]}
                    onChange={(v) => {
                      if (v) {
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
