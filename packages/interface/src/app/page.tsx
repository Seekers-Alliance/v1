'use client';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EventList } from '@/components/EventList';
import CardProbabilityPieChart from '@/components/CardProbabilityPieChart';
import NFTCard from '@/components/NFTCard';
import { Button } from 'antd';
import NFTMultiSelect from '@/components/NFTMultiSelect';
import AddProbabilityCard from "@/components/AddProbabilityCard";

export default function Home() {
  return (
    <main className='flex flex-col items-center justify-between bg-black p-24'>
      welcome to home
        <AddProbabilityCard/>
    </main>
  );
}
