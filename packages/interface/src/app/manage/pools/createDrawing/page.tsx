'use client';
import { Layout } from 'antd';
import { Primary2Button } from '@/components/Button';
import React, { useEffect } from 'react';
import SetUnitProbabilitySection from '@/components/SetUnitProbabilitySection';
import SetDrawingProbabilitySection from '@/components/SetDrawingProbabilitySection';
import { useRouter } from 'next/navigation';
import { PoolProcessStatus } from '@/types';
import { usePoolProcessStatusStore } from '@/stores/poolProcessStatus';

const { Footer } = Layout;

export default function Page() {
  const { status, updateStatus } = usePoolProcessStatusStore();
  const router = useRouter();
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
      <div className='mt-[38px] flex w-[950px] flex-col gap-4'>
        {poolNames.slice(0, poolAmount).map((poolName, index) => {
          return (
            <SetDrawingProbabilitySection poolName={poolName} key={index} />
          );
        })}
      </div>
      <div className='mt-[23px] w-[300px]'>
        <Primary2Button onClick={handleNextStep}>Next Step</Primary2Button>
      </div>
    </div>
  );
}
