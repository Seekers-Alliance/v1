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

  return (
    <main className='flex min-h-screen bg-black bg-[url("/repository.png")]'>
      <div className='fixed left-[457px] top-[108px]'>
        <img className='h-[526px] w-[526px]' src='/mock.gif' alt='mock' />
      </div>
    </main>
  );
}
