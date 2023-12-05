import EditPoolInput from '@/components/EditPoolInput';
import { AddCard } from '@/components/AddCard';
import { SpecificChainButton } from '@/components/Button';
import React, { useCallback, useEffect, useMemo } from 'react';
import ProbabilityInputCard from '@/components/ProbabilityInputCard';
import { useUnitPoolStore } from '@/stores/unitPool';
import { TransactionAction } from '@/components/transaction';
import useTxnNotify from '@/hooks/useTxnNotify';
import NFTProfile from '@/components/NFTProfile';
import useDrawingTxn from '@/hooks/useDrawingTxn';
import { useTokenList } from '@/hooks/useTokenList';

interface SetUnitProbabilitySectionProps {
  // TODO: fake index to be replaced
  index: number;
  poolName: string;
}

export default function SetUnitProbabilitySection({
  index,
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
  } = useDrawingTxn('setAtomic');
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
    add({
      id: index.toString(),
      name: poolName,
      probabilities: probabilityList,
    });
    // submit?.({ args: [1, probabilityList] });
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
  // useEffect(() => {
  //   if (isConfirmSuccess) {
  //     add({
  //       id: index.toString(),
  //       name: poolName,
  //       probabilities: probabilityList,
  //     });
  //   }
  // }, [isConfirmSuccess]);

  useEffect(() => {
    if (tokenList && probabilityList.length === 0) {
      setProbabilityList(
        (tokenList as bigint[]).map((i) => {
          return 0;
        })
      );
    }
  }, [tokenList, probabilityList]);
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
