import EditPoolInput from '@/components/EditPoolInput';
import { AddCard } from '@/components/AddCard';
import AddProbabilityCard from '@/components/AddProbabilityCard';
import { Primary2Button } from '@/components/Button';
import React, {useCallback, useMemo} from 'react';
import ProbabilityInputCard from '@/components/ProbabilityInputCard';
import {TOKEN_LIST} from "@/types";
import {useUnitPoolStore} from "@/stores/unitPool";
import {useDrawingPoolStore} from "@/stores/drawingPool";

interface SetDrawingProbabilitySectionProps {
  poolName: string;
}

export default function SetDrawingProbabilitySection({
  poolName,
}: SetDrawingProbabilitySectionProps) {
  const {getPool,add}=useDrawingPoolStore();
  const {pools:unitPools}=useUnitPoolStore();
  const poolProbabilityList=useMemo(
      ()=>getPool(poolName)?.probabilities || Array.from({length:unitPools.list.length},()=>0),
      [poolName])
  const [probabilityList,setProbabilityList]=React.useState<number[]>(poolProbabilityList)
  console.log(getPool(poolName))
  const handleSetProbabilities=useCallback(()=>{
        console.log('setProbabilities')
        add({
          name:poolName,
          probabilities:probabilityList,
        })
        console.log(probabilityList)
      },
      [poolName,add,probabilityList])
  const handleUpdateProbability=useCallback((index:number,value:number)=>{
    probabilityList[index]=value
    setProbabilityList(probabilityList)
  },[probabilityList])
  return (
    <div>
      <div className='flex flex-col gap-4'>
        <div className='w-[300px]'>
          <EditPoolInput>{poolName}</EditPoolInput>
        </div>
        <div className='grid grid-flow-dense grid-cols-8 gap-2'>
          <div className='h-[122px] w-[110px]'>
            <AddCard>Add Unit</AddCard>
          </div>
          {unitPools.list.map((name, index) => {
            return (
              <div className='w-[110px]' key={index}>
                <ProbabilityInputCard defaultValue={poolProbabilityList[index]} onChange={(v)=>{
                  if (v) {
                    console.log(v)
                    handleUpdateProbability(index,Number(v))
                  }
                }}>
                  <div className='mt-1 flex h-[76px] w-[100%] items-center px-2'>
                    <div className="font-['Source Sans Pro'] text-[14px] text-white">
                      {name}
                    </div>
                  </div>
                </ProbabilityInputCard>
              </div>
            );
          })}
        </div>
        <div className='w-[300px]'>
          <Primary2Button onClick={handleSetProbabilities}>Set Probabilities</Primary2Button>
        </div>
      </div>
    </div>
  );
}
