'use client';
import { Layout } from 'antd';
import { Primary2Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { ConnectWallet2Button } from '@/components/ConnectWalletButton';
const { Footer } = Layout;

export default function Page() {
  const router = useRouter();
  const handleNextStep = () => {
    router.push('/manage/pools/count');
  };
  return (
    <div className='flex justify-center'>
      <div className='fixed top-[206px]'>
        <div className='flex flex-col gap-[39px]'>
          <div className='flex justify-center'>
            <img src='/Seekers-Alliance-1.png' width={200} height={200} />
          </div>
          <div>
            <span className="font-['Inter'] text-[50px] font-extrabold uppercase leading-[50px] text-white">
              CONFIGURE <br />
            </span>
            <span className="font-['Inter'] text-[50px] font-extrabold uppercase leading-[50px] text-violet-400">
              PULL RATES
            </span>
          </div>
          <div className='h-[40px] w-[300px]'>
            <ConnectWallet2Button onAfterConnect={handleNextStep}>
              Next Step
            </ConnectWallet2Button>
          </div>
        </div>
      </div>
    </div>
  );
}
