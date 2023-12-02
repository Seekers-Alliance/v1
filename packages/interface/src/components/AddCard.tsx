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

export function AddCard({children, onClick}: AddCardProps) {
  return (
    <BaseCard
         className='w-[100%] h-[100%]'
      bodyStyle={{
        paddingTop: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
          width: `100%`,
          height: `100%`,
      }}
    >
        <div className='w-[100%] h-[100%] flex flex-col items-center justify-center'>
            <img src='/add.svg' className='w-[30px] h-[30px]' />
            <div className="text-yellow-400 text-sm font-normal font-['Work Sans']">{children}</div>
        </div>
    </BaseCard>
  );
}
