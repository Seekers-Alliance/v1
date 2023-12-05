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
        <div className='flex h-[40px] w-[100%] items-center border-t-[1px] border-solid border-[#374151]'>
          <div className='w-[100%] inline-flex items-center justify-between p-2'>
            <InputNumber
              className='border-0 bg-[#111827] text-white'
              onChange={onChange}
              defaultValue={defaultValue || 0}
            />
            <div className='text-white'>%</div>
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
