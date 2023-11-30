import {Card, Input} from "antd";
import styled from "styled-components";


const AddCard=styled(Card)`
  border-radius: 4px;
  border: 1px solid #374151;
  background: #111827;
`

export default function AddProbabilityCard(){
    return (
        <AddCard bodyStyle={{
            paddingTop:'5px',
            paddingBottom:'0px',
            paddingLeft:'0px',
            paddingRight:'0px',
        }}>
            <div className="w-[110px] flex flex-col items-center justify-between">
                <div className="w-[100%] text-white text-[12px] font-bold font-['Space Grotesk'] uppercase px-2">ID-001</div>
                <img src="/Bubble%20Gunner.png"  className='w-[110px]'/>
                <div
                    className="w-[100%] h-[40px] border-t-[1px] border-solid border-[#374151]">
                    {/*<Input className="w-[100%] bg-[#111827] border-0"/>*/}
                </div>
            </div>
        </AddCard>
    )
}
