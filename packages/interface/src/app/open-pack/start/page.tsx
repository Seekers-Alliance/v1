'use client';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useCallback } from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Page() {
  const router = useRouter();
  const handleToBuy = useCallback(() => {
    console.log('connected');
    router.push('/open-pack/buy');
  }, [router]);
  return (
    <main className='flex min-h-screen bg-black bg-[url("/home.png")]'>
      <div className='fixed left-[768px] top-[528px]'>
        <div className='flex h-[60px] w-[465px] flex-row gap-4'>
          <ConnectWalletButton onAfterConnect={handleToBuy}>
            {'BUY PACKS'}
          </ConnectWalletButton>
        </div>
      </div>
    </main>
  );
}
