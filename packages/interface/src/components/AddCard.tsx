import { Card, Input } from 'antd';
import styled from 'styled-components';

const BaseCard = styled(Card)`
  border-radius: 4px;
  border: 1px solid #374151;
  background: #111827;
`;

interface AddCardProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

export function AddCard({ children, onClick }: AddCardProps) {
  return (
    <BaseCard
      className='h-[100%] w-[100%]'
      bodyStyle={{
        paddingTop: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
        width: `100%`,
        height: `100%`,
      }}
    >
      <div className='flex h-[100%] w-[100%] flex-col items-center justify-center'>
        <img src='/add.svg' className='h-[30px] w-[30px]' />
        <div className="font-['Work Sans'] text-sm font-normal text-yellow-400">
          {children}
        </div>
      </div>
    </BaseCard>
  );
}
