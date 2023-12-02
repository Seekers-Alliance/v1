import React from 'react';
import { Layout } from 'antd';
import { usePoolProcessStatusStore } from '@/stores/poolProcessStatus';
import { PoolProcessStatus } from '@/types';

const { Header } = Layout;

export default function PoolProcessHeader() {
  const { status } = usePoolProcessStatusStore();
  let title = '';
  let subTitle = '';
  switch (status) {
    case PoolProcessStatus.SelectNFT:
      title = 'TokenID Pool';
      subTitle = 'Contains all possible prizes';
      break;
    case PoolProcessStatus.CreateUnit:
      title = 'Unit Pools';
      subTitle = 'Customizable categorizations';
      break;
    case PoolProcessStatus.CreatePool:
      title = 'Drawing Pools';
      subTitle = 'Customizable based on game use cases';
      break;
    case PoolProcessStatus.Done:
      title = 'Final Configurations';
      subTitle =
        'Values have been set in the "HierarchicalDrawing" smart contract';
      break;
  }
  return (
    <Header className='inline-flex items-center justify-start bg-gray-800'>
      <div className='mt-[39px] inline-flex items-center justify-start gap-4'>
        <div className='h-10 w-1 bg-yellow-400'></div>
        <div className='inline-flex flex-col items-start justify-start gap-1'>
          <div className="font-['Work Sans'] self-stretch text-xl font-bold text-white">
            {title}
          </div>
          <div className="font-['Work Sans'] self-stretch text-sm font-normal text-indigo-300">
            {subTitle}
          </div>
        </div>
      </div>
    </Header>
  );
}
