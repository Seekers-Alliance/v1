'use client';
import { Layout } from 'antd';
import { Primary2Button } from '@/components/Button';
import React, { useCallback, useEffect } from 'react';
import SetUnitProbabilitySection from '@/components/SetUnitProbabilitySection';
import { useRouter } from 'next/navigation';
import { PoolProcessStatus } from '@/types';
import { usePoolProcessStatusStore } from '@/stores/poolProcessStatus';
import useDrawingRead from '@/hooks/useDrawingRead';
import AddPoolButton from '@/components/AddPoolButton';

const { Footer } = Layout;

export default function Page() {
  const { status, updateStatus } = usePoolProcessStatusStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const handleLoading = useCallback((l: boolean) => {
    setIsLoading(l);
  }, []);
  const handleNextStep = () => {
    router.push('/manage/pools/createDrawing');
  };
  const poolNames = [
    'Unit Pool A : Rares',
    'Unit Pool B : Uncommons',
    'Unit Pool C : Commons',
  ];
  const [poolAmount, setPoolAmount] = React.useState(3);
  useEffect(() => {
    if (status !== PoolProcessStatus.CreateUnit) {
      updateStatus(PoolProcessStatus.CreateUnit);
    }
  }, [status]);
  // const {isLoading,error,data}=useDrawingRead('ids',[0])
  // useEffect(() => {
  //   console.log(isLoading)
  //   console.log(error)
  //   if (data) {
  //     console.log(data)
  //   }
  // }, [data]);
  return (
    <div className='flex flex-col justify-start'>
      <div className='h-[40px] w-[300px]'>
        <AddPoolButton>Add Unit Pool</AddPoolButton>
      </div>
      <div className='mt-[38px] flex w-[950px] flex-col gap-4'>
        {poolNames.slice(0, poolAmount).map((poolName, index) => {
          return (
            <SetUnitProbabilitySection
              onLoading={handleLoading}
              poolName={poolName}
              key={index}
            />
          );
        })}
      </div>
      <div className='mt-[23px] w-[300px]'>
        <Primary2Button loading={isLoading} onClick={handleNextStep}>
          Next Step
        </Primary2Button>
      </div>
    </div>
  );
}
