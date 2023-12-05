import { Card, Input, InputNumber } from 'antd';
import styled from 'styled-components';
import { useCallback, useEffect, useState } from 'react';
import Icon from '@ant-design/icons';

interface CountInputCardProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}

export default function CountInputCard({
  children,
  onChange,
  defaultValue,
}: CountInputCardProps) {
  const [isInfinite, setIsInfinite] = useState(false);
  const infinite = 'Unlimited';
  const handleChange = useCallback(
    (value: string) => {
      if (value === infinite) {
        setIsInfinite(true);
        onChange?.(MAX_UINT32.toString());
      } else {
        setIsInfinite(false);
        onChange?.(value);
      }
    },
    [onChange]
  );
  const handleClickInfinite = useCallback(() => {
    setIsInfinite(true);
  }, [isInfinite]);
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
          <div className='inline-flex w-[100%] items-center justify-between p-2'>
            <Input
              className='border-0 bg-[#111827] text-[10px] text-white'
              onChange={(e) => {
                handleChange(e.target.value);
              }}
              defaultValue={defaultValue}
              value={isInfinite ? infinite : undefined}
            />
            <Icon
              component={() => <img src='/infinite.svg' width={25} />}
              onClick={handleClickInfinite}
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

const MAX_UINT32 = BigInt('4294967295');
