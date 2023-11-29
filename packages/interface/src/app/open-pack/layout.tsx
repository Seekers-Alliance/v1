'use client';
import { ReactNode } from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className='fixed left-[131px] top-[50px] w-[220px]'>
        <SimpleNavbar />
      </div>
      <div className='fixed left-[900px] top-[56px]'>
        <div className='inline-flex w-[400px] justify-end'>
          <ConnectButton />
        </div>
      </div>
      {children}
    </>
  );
}
