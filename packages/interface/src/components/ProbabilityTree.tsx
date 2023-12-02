import { Tooltip, Tree } from 'antd';
import React from 'react';
import styled from 'styled-components';

export default function ProbabilityTree() {
  const drawingPoolNames = ['Normal Card Pack', 'Special Card Pack'];
  const unitPoolNames = ['Rares', 'Uncommons', 'Commons'];
  const tokenIDNames = [
    'ID-001',
    'ID-002',
    'ID-003',
    'ID-004',
    'ID-005',
    'ID-006',
  ];
  const [poolAmount, setPoolAmount] = React.useState(2);
  const data = drawingPoolNames.map((poolName, index) => {
    return {
      key: `0-${index}`,
      title: <Title className='text-[20px]'>{poolName}</Title>,
      children: unitPoolNames.map((unitPoolName, index2) => {
        return {
          key: `0-${index}-${index2}`,
          title: (
            <Title className='text-[16px]'>
              {unitPoolName} <span className='text-[#ADC0F8]'>10%</span>
            </Title>
          ),
          children: tokenIDNames.map((tokenIDName, index3) => {
            return {
              key: `0-${index}-${index2}-${index3}`,
              title: (
                <Title className='text-[12px]'>
                  {tokenIDName} <span className='text-[#ADC0F8]'>10%</span>
                </Title>
              ),
            };
          }),
        };
      }),
    };
  });
  return (
    <Tree
      className='bg-gray-800'
      treeData={data}
      defaultExpandedKeys={['0-0', '0-1', '0-0-1']}
      titleRender={(item) => (
        <Tooltip title={item.title as any}>{item.title as any}</Tooltip>
      )}
    />
  );
}

const Title = styled('div')`
  color: #fff;
  font-family: 'Inter', sans-serif;
  //font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 126.8%; /* 25.36px */
`;
