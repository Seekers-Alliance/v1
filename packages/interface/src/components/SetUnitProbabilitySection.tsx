import EditPoolInput from '@/components/EditPoolInput';
import { AddCard } from '@/components/AddCard';
import AddProbabilityCard from '@/components/AddProbabilityCard';
import { Primary2Button } from '@/components/Button';
import React, {useCallback, useMemo} from 'react';
import ProbabilityInputCard from '@/components/ProbabilityInputCard';
import {TOKEN_LIST} from "@/types";
import {useUnitPoolStore} from "@/stores/unitPool";

interface SetUnitProbabilitySectionProps {
  poolName: string;
}

export default function SetUnitProbabilitySection({
  poolName,
}: SetUnitProbabilitySectionProps) {
  const {getPool,add}=useUnitPoolStore();
  const poolProbabilityList=useMemo(
      ()=>getPool(poolName)?.probabilities || Array.from({length:TOKEN_LIST.length},()=>0),
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
          <div className='h-[220px] w-[110px]'>
            <AddCard>Add Card</AddCard>
          </div>
          {TOKEN_LIST.map((item, index) => {
            return (
              <div className='h-52 w-[110px]' key={index}>
                <ProbabilityInputCard defaultValue={poolProbabilityList[index]} onChange={(v)=>{
                  if (v) {
                    console.log(v)
                    handleUpdateProbability(index,Number(v))
                  }
                }}>
                  <div className="font-['Space Grotesk'] mt-1 w-[100%] px-2 text-[12px] font-bold uppercase text-white">
                    {`ID-${item.toString().padStart(3, '0')}`}
                  </div>
                  <img src='/Bubble%20Gunner.png' />
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
