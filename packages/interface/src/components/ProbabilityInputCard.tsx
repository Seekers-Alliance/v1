import { Card, Input } from 'antd';
import styled from 'styled-components';

interface ProbabilityInputCardProps {
  children?: React.ReactNode;
}

export default function ProbabilityInputCard({
  children,
}: ProbabilityInputCardProps) {
  return (
    <BaseCard
      bodyStyle={{
        paddingTop: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
        width: `100%`,
        height: `100%`,
      }}
    >
      <div className='flex h-[100%] w-[100%] flex-col items-center justify-between'>
        {children}
        {/*<div className="mt-1 font-['Space Grotesk'] w-[100%] px-2 text-[12px] font-bold uppercase text-white">*/}
        {/*  ID-001*/}
        {/*</div>*/}
        {/*<img src='/Bubble%20Gunner.png' className='w-[110px]' />*/}
        <div className='h-[40px] w-[100%] border-t-[1px] border-solid border-[#374151]'>
          {/*<Input className="w-[100%] bg-[#111827] border-0"/>*/}
        </div>
      </div>
    </BaseCard>
  );
}

const BaseCard = styled(Card)`
  border-radius: 4px;
  border: 1px solid #374151;
  background: #111827;
`;
