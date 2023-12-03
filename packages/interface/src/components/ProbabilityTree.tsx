import { Tooltip, Tree } from 'antd';
import React, {useMemo} from 'react';
import styled from 'styled-components';
import {useDrawingPoolStore} from "@/stores/drawingPool";
import {useUnitPoolStore} from "@/stores/unitPool";
import {TOKEN_LIST} from "@/types";

export default function ProbabilityTree() {
  const {pools:drawingPools,getPool:getDrawingPool}=useDrawingPoolStore()
  const {pools:unitPools,getPool:getUnitPool}=useUnitPoolStore()
  const drawingPoolNames = useMemo(()=>drawingPools.list,[drawingPools])
  const unitPoolNames = useMemo(()=>unitPools.list,[unitPools])
  const tokenIDNames = TOKEN_LIST.map((item) => {
    return `ID-${item.toString().padStart(3, '0')}`;
  });
  const data = drawingPoolNames.map((poolName, index) => {
    return {
      key: `0-${index}`,
      title: <Title className='text-[20px]'>{poolName}</Title>,
      children: unitPoolNames.map((unitPoolName, index2) => {
        const probabilities=getDrawingPool(poolName)?.probabilities || Array.from({length:unitPoolNames.length},()=>0)
        return {
          key: `0-${index}-${index2}`,
          title: (
            <Title className='text-[16px]'>
              {unitPoolName} <span className='text-[#ADC0F8]'>{probabilities[index2]}%</span>
            </Title>
          ),
          children: tokenIDNames.map((tokenIDName, index3) => {
            const probabilities=getUnitPool(unitPoolName)?.probabilities || Array.from({length:TOKEN_LIST.length},()=>0)
            return {
              key: `0-${index}-${index2}-${index3}`,
              title: (
                <Title className='text-[12px]'>
                  {tokenIDName} <span className='text-[#ADC0F8]'>{probabilities[index3]}%</span>
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
      defaultExpandedKeys={['0-0', '0-1', '0-0-0']}
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
