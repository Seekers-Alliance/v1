import React, { ReactNode } from 'react';

interface AddPoolButtonProps {
  onClick?: () => void;
  children?: ReactNode;
}
export default function AddPoolButton({
  onClick,
  children,
}: AddPoolButtonProps) {
  return (
    <div className='flex h-[100%] w-[100%] flex-row items-center justify-between rounded border border-gray-700 bg-gray-900 px-3'>
      <div className="font-['Source Sans Pro'] text-sm font-normal leading-normal text-yellow-400">
        {children}
      </div>
      <div onClick={onClick}>
        <img src={'/add.svg'} width={15} />
      </div>
    </div>
  );
}
