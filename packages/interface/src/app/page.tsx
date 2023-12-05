'use client';
import { PrimaryButton } from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const handleBuyPack = () => {
    router.push('/open-pack/start');
  };
  const handleSetupDrawingPool = () => {
    router.push('/manage/');
  };
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gray-800 p-24'>
      <div className='flex flex-col items-center gap-2'>
        <div className='h-[50px] w-[500px]'>
          <PrimaryButton onClick={handleBuyPack}>
            User Story - Buy Packs
          </PrimaryButton>
        </div>
        <div className='h-[50px] w-[500px]'>
          <PrimaryButton onClick={handleSetupDrawingPool}>
            Manager Story - Setup Drawing Pool
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
}
