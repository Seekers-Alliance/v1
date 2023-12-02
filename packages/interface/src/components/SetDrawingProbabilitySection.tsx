import EditPoolInput from "@/components/EditPoolInput";
import {AddCard} from "@/components/AddCard";
import AddProbabilityCard from "@/components/AddProbabilityCard";
import {Primary2Button} from "@/components/Button";
import React from "react";
import ProbabilityInputCard from "@/components/ProbabilityInputCard";


interface SetDrawingProbabilitySectionProps {
    poolName: string;
}

export default function SetDrawingProbabilitySection({poolName}: SetDrawingProbabilitySectionProps){
    return (
        <div>
            <div className='flex flex-col gap-4'>
                <div className="w-[300px]">
                    <EditPoolInput>{poolName}</EditPoolInput>
                </div>
                <div className='grid grid-flow-dense grid-cols-8 gap-2'>
                    <div className='w-[110px] h-[122px]'>
                        <AddCard>
                            Add Unit
                        </AddCard>
                    </div>
                    {new Array(3).fill(0).map((_, index) => {
                        return (
                            <div className='w-[110px]' key={index}>
                                <ProbabilityInputCard>
                                    <div className='flex items-center mt-1 w-[100%] h-[76px] px-2'>
                                        <div className="font-['Source Sans Pro'] text-[14px] text-white">
                                            Unit Pool A Rares
                                        </div>
                                    </div>
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
