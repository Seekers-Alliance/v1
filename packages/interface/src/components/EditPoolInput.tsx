import { DeleteFilled, EditFilled } from '@ant-design/icons';
import React from 'react';

interface EditPoolInputProps {
  children?: React.ReactNode;
}

export default function EditPoolInput({ children }: EditPoolInputProps) {
  return (
    <div className='inline-flex h-[40px] w-[100%] items-center justify-between rounded border border-gray-700 bg-slate-700 px-[8px]'>
      <div className="font-['Source Sans Pro'] text-sm font-normal leading-normal text-white">
        {children}
      </div>
      <div className='inline-flex gap-2'>
        <EditFilled style={{ color: '#FFFFFF' }} />
        <DeleteFilled style={{ color: '#FFFFFF' }} />
      </div>
    </div>
  );
}
