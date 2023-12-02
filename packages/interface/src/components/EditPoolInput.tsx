import {DeleteFilled, EditFilled} from "@ant-design/icons";
import React from "react";

interface EditPoolInputProps {
    children?: React.ReactNode
}

export default function EditPoolInput({children}: EditPoolInputProps){
    return (
        <div className="w-[100%] inline-flex justify-between items-center h-[40px] px-[8px] bg-slate-700 rounded border border-gray-700">
            <div className="text-white text-sm font-normal font-['Source Sans Pro'] leading-normal">{children}</div>
            <div className='inline-flex gap-2'>
                <EditFilled style={{color:'#FFFFFF'}}/>
                <DeleteFilled style={{color:'#FFFFFF'}} />
            </div>
        </div>
    )
}
