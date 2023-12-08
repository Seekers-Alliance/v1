'use client';
import { Layout } from 'antd';
import { Primary2Button } from '@/components/Button';
import React, { useCallback, useEffect } from 'react';
import SetDrawingProbabilitySection from '@/components/SetDrawingProbabilitySection';
import { useRouter } from 'next/navigation';
import { PoolProcessStatus } from '@/types';
import { usePoolProcessStatusStore } from '@/stores/poolProcessStatus';
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
    router.push('/manage/pools/final');
  };
  const poolNames = [
    'Drawing Pool A: Normal Card Pack',
    'Drawing Pool B: Special Card Pack',
  ];
  const [poolAmount, setPoolAmount] = React.useState(2);
  useEffect(() => {
    if (status !== PoolProcessStatus.CreatePool) {
      updateStatus(PoolProcessStatus.CreatePool);
    }
  }, [status]);
  return (
    <div className='flex flex-col justify-start'>
      <div className='h-[40px] w-[300px]'>
        <AddPoolButton>Add Drawing Pool</AddPoolButton>
      </div>
      <div className='mt-[38px] flex w-[950px] flex-col gap-4'>
        {poolNames.slice(0, poolAmount).map((poolName, index) => {
          return (
            <SetDrawingProbabilitySection
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
