import { Card, Input } from 'antd';
import styled from 'styled-components';

const AddCard = styled(Card)`
  border-radius: 4px;
  border: 1px solid #374151;
  background: #111827;
`;

export default function AddProbabilityCard() {
  return (
    <AddCard
      bodyStyle={{
        paddingTop: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
      }}
    >
      <div className='flex w-[110px] flex-col items-center justify-between'>
        <div className="font-['Space Grotesk'] mt-1 w-[100%] px-2 text-[12px] font-bold uppercase text-white">
          ID-001
        </div>
        <img src='/Bubble%20Gunner.png' className='w-[110px]' />
        <div className='h-[40px] w-[100%] border-t-[1px] border-solid border-[#374151]'>
          {/*<Input className="w-[100%] bg-[#111827] border-0"/>*/}
        </div>
      </div>
    </AddCard>
  );
}
