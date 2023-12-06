'use client';
import { useCallback, useEffect, useState } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const hash = searchParams.get('hash') || '0x445f4274aef2f538287cce24663922e0d2ad3bf9a22c1e9c7acebe19e272aff1'
  const handleAfterAnimation = useCallback(() => {
    console.log('after animation');
    router.push(`/receipts/${hash}`);
  }, []);
  useEffect(() => {
    setTimeout(() => {
      handleAfterAnimation();
    }, 6500);
  }, []);
  const animationUrl = `https://ipfs.io/ipfs/Qmb1Sv1mPHagk59BVDu8jacQ6pF7ompU2naPbWgws8ff1V`;
  return (
    <main className='flex min-h-screen bg-black bg-[url("/repository.png")]'>
      <div className='fixed left-[457px] top-[120px]'>
        <video width={526} height={526} autoPlay muted playsInline loop>
          <source src={animationUrl} />
        </video>
      </div>
    </main>
  );
}
