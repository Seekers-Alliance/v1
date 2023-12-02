import React from "react";
import {Layout} from "antd";
import {usePoolProcessStatusStore} from "@/stores/poolProcessStatus";
import {PoolProcessStatus} from "@/types";

const {Header} = Layout;

export default function PoolProcessHeader() {
    const {status}=usePoolProcessStatusStore()
    let title=''
    let subTitle=''
    switch (status) {
        case PoolProcessStatus.SelectNFT:
            title='TokenID Pool'
            subTitle='Contains all possible prizes'
            break;
        case PoolProcessStatus.CreateUnit:
            title='Unit Pools'
            subTitle='Customizable categorizations'
            break;
        case PoolProcessStatus.CreatePool:
            title='Drawing Pools'
            subTitle='Customizable based on game use cases'
            break;
        case PoolProcessStatus.Done:
            title='Final Configurations'
            subTitle='Values have been set in the "HierarchicalDrawing" smart contract'
            break;
    }
    return (
        <Header className="justify-start items-center inline-flex bg-gray-800">
            <div className="mt-[39px] justify-start items-center gap-4 inline-flex">
                <div className="w-1 h-10 bg-yellow-400"></div>
                <div className="flex-col justify-start items-start gap-1 inline-flex">
                    <div className="self-stretch text-white text-xl font-bold font-['Work Sans']">{title}</div>
                    <div className="self-stretch text-indigo-300 text-sm font-normal font-['Work Sans']">{subTitle}</div>
                </div>
            </div>
        </Header>
    )
}


