import {Modal, Steps} from "antd";
import {PrimaryButton} from "@/components/Button";
import {useEffect, useState} from "react";

interface OpenStepModalProps {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
}

export default function OpenStepModal({open, onOk, onCancel}: OpenStepModalProps) {
    const [current, setCurrent] = useState(3);


    const item=[
        {
            title: 'OPEN N PACKS'
        },
        {
            title: 'WAITING FOR RANDOM WORDS',
            subTitle: 'VRF',
        },
        {
            title: 'RANDOM WORD RECEIVED, EXECUTE DRAWS',
            subTitle: 'Automation',
        },
        {
            title: 'SEE CARDS',
        }
    ]

    // useEffect(() => {
    //     if (current === 3) {
    //         return
    //     }
    //     setInterval(() => {
    //         setCurrent((current) => current + 1);
    //     },5000)
    // }, [current]);
    return (
        <Modal
            width={600}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    <CancelBtn />
                    <OkBtn />
                </>
            )}
        >
            <div className='mt-8 w-[100%] h-[450px]'>
                <Steps
                    className='h-[400px]'
                    direction="vertical"
                    current={current}
                    items={item}
                />
            </div>
        </Modal>
    )
}
