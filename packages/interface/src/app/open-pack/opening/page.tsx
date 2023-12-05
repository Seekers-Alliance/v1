'use client';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EventList } from '@/components/EventList';
import CardProbabilityPieChart from '@/components/CardProbabilityPieChart';
import NFTCard from '@/components/NFTCard';
import { Button, Modal } from 'antd';
import { OpeningSteps } from '@/components/OpeningSteps';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  PrimaryButton,
  SelectedButton,
  SelectingButton,
  UnSelectedButton,
} from '@/components/Button';
import { ExportOutlined } from '@ant-design/icons';
import SimpleNavbar from '@/components/SimpleNavbar';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const handleAfterAnimation = useCallback(() => {
    console.log('after animation');
    router.push('/receipts');
  }, []);
  useEffect(() => {
    setTimeout(() => {
      handleAfterAnimation();
    }, 3000);
  }, []);
  const animationUrl=`https://ipfs.io/ipfs/Qmb1Sv1mPHagk59BVDu8jacQ6pF7ompU2naPbWgws8ff1V`;
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
