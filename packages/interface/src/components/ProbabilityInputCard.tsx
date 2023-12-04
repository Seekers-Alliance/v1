import { Card, Input, InputNumber } from 'antd';
import styled from 'styled-components';

interface ProbabilityInputCardProps {
  defaultValue?: number;
  onChange?: (value: number | string | null) => void;
  children?: React.ReactNode;
}

export default function ProbabilityInputCard({
  children,
  onChange,
  defaultValue,
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
        <div className='h-[40px] w-[100%] flex items-center border-t-[1px] border-solid border-[#374151]'>
            <div className='p-2 inline-flex justify-between items-center'>
                <div className='text-white'>
                    %
                </div>
                <InputNumber
                    className='w-[100%] border-0 bg-[#111827] text-white'
                    onChange={onChange}
                    defaultValue={defaultValue || 0}
                />
            </div>
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
