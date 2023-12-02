'use client';
import AddProbabilityCard from '@/components/AddProbabilityCard';
import { Primary2Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { AddCard } from '@/components/AddCard';
import { usePoolProcessStatusStore } from '@/stores/poolProcessStatus';
import { useEffect } from 'react';
import { PoolProcessStatus } from '@/types';

export default function Page() {
  const { status, updateStatus } = usePoolProcessStatusStore();
  const router = useRouter();
  const handleNextStep = () => {
    router.push('/manage/pools/createUnit');
  };
  useEffect(() => {
    if (status !== PoolProcessStatus.SelectNFT) {
      updateStatus(PoolProcessStatus.SelectNFT);
    }
  }, [status]);
  return (
    <div className='flex flex-col justify-start'>
      <div className='mt-[38px] w-[950px]'>
        <div className='grid grid-flow-dense grid-cols-8 gap-2'>
          <div className='w-[110px]'>
            <AddCard>Add NFT</AddCard>
          </div>
          {new Array(7).fill(0).map((_, index) => {
            return (
              <div className='h-52 w-[110px]' key={index}>
                <AddProbabilityCard key={index} />
              </div>
            );
          })}
        </div>
      </div>
      <div className='mt-[23px] w-[300px]'>
        <Primary2Button>Set Mint Caps</Primary2Button>
      </div>
      <div className='mt-[23px] w-[300px]'>
        <Primary2Button onClick={handleNextStep}>Next Step</Primary2Button>
      </div>
    </div>
  );
}
