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
  const handleOpen = useCallback(() => {
    console.log('open');
    router.push('/open-pack/opening');
  }, []);

  return (
    <main className='flex min-h-screen bg-black bg-[url("/purchase.png")]'>
      <div className='fixed left-[529px] top-[486px]'>
        <div className='flex h-[140px] w-[383px] flex-col justify-between gap-4'>
          <PrimaryButton onClick={handleOpen}>{'OPEN PACKS*'}</PrimaryButton>
          <PrimaryButton onClick={handleOpen}>
            {'OPEN SPECIAL PACK'}
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
}
