import EditPoolInput from "@/components/EditPoolInput";
import {AddCard} from "@/components/AddCard";
import AddProbabilityCard from "@/components/AddProbabilityCard";
import {Primary2Button} from "@/components/Button";
import React from "react";
import ProbabilityInputCard from "@/components/ProbabilityInputCard";


interface SetUnitProbabilitySectionProps {
    poolName: string;
}

export default function SetUnitProbabilitySection({poolName}: SetUnitProbabilitySectionProps){
    return (
        <div>
            <div className='flex flex-col gap-4'>
                <div className="w-[300px]">
                    <EditPoolInput>{poolName}</EditPoolInput>
                </div>
                <div className='grid grid-flow-dense grid-cols-8 gap-2'>
                    <div className='w-[110px] h-[220px]'>
                        <AddCard>
                            Add Card
                        </AddCard>
                    </div>
                    {new Array(7).fill(0).map((_, index) => {
                        return (
                            <div className='w-[110px] h-52' key={index}>
                                <ProbabilityInputCard>
                                    <div className="mt-1 font-['Space Grotesk'] w-[100%] px-2 text-[12px] font-bold uppercase text-white">
                                        ID-001
                                    </div>
                                    <img src='/Bubble%20Gunner.png'/>
                                </ProbabilityInputCard>
                            </div>
                        )
                    })}
                </div>
                <div className="w-[300px]">
                    <Primary2Button>Set Probabilities</Primary2Button>
                </div>
            </div>
        </div>
    )
}
