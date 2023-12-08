import { Modal, Steps } from 'antd';
import { PrimaryButton } from '@/components/Button';
import { useEffect, useMemo, useState } from 'react';
import useWaitForFulfill from '@/hooks/useWaitForFulfill';
import useWaitForRequestCompleted from '@/hooks/useWaitForRequestCompleted';
import { getConfig } from '@/config';

interface OpenStepModalProps {
  open: boolean;
  requestId?: bigint;
  onStatusChanged?: (status: StepStatus) => void;
  onCompleted?: (hash: `0x${string}`) => void;
  onOk: () => void;
  onCancel: () => void;
}

export default function OpenStepsModal({
  requestId,
  onCompleted,
  open,
  onOk,
  onCancel,
}: OpenStepModalProps) {
  const { vrfUrl, automationUrl } = getConfig();
  const [current, setCurrent] = useState(StepStatus.WaitingForRandomWords);
  const [itemStatus, setItemStatus] = useState<string | undefined>(undefined);
  const {
    isSuccess: isFulfillSuccess,
    isError: isFulfillError,
    isLoading: isFulfillLoading,
    error: fulfillError,
    fulfillHash,
  } = useWaitForFulfill(requestId);

  const {
    isSuccess: isCompletedSuccess,
    isError: isCompletedError,
    isLoading: isCompletedLoading,
    error: completedError,
    completeHash,
  } = useWaitForRequestCompleted(requestId);

  const item = useMemo(
    () => [
      {
        title: <h1 className='text-lg text-white'>OPEN N PACKS</h1>,
      },
      {
        title: (
          <h1 className='text-lg text-white'>
            WAITING FOR RANDOM WORDS(
            <a href={vrfUrl || ''} rel='noreferrer' target='_blank'>
              Link
            </a>
            )
          </h1>
        ),
      },
      {
        title: (
          <h1 className='text-lg text-white'>
            RANDOM WORD RECEIVED, EXECUTE DRAWS(
            <a href={automationUrl || ''} rel='noreferrer' target='_blank'>
              Link
            </a>
            )
          </h1>
        ),
      },
      {
        title: <h1 className='text-lg text-white'>SEE CARDS</h1>,
      },
    ],
    [fulfillHash, completeHash]
  );

  useEffect(() => {
    if (isFulfillSuccess && current === StepStatus.WaitingForRandomWords) {
      setCurrent(StepStatus.WaitingForExecuteDraws);
    }
  }, [isFulfillSuccess, itemStatus]);

  useEffect(() => {
    if (isCompletedSuccess && current === StepStatus.WaitingForExecuteDraws) {
      setCurrent(StepStatus.SeeCards);
      setItemStatus('finish');
    }
  }, [isCompletedSuccess, itemStatus]);

  useEffect(() => {
    if (isFulfillError || isCompletedError) {
      setItemStatus('error');
    }
  }, [isFulfillError, isCompletedError]);

  useEffect(() => {
    if (isFulfillLoading || isCompletedLoading) {
      setItemStatus('process');
    }
  }, [isFulfillLoading, isCompletedLoading]);

  useEffect(() => {
    if (fulfillError || completedError) {
      setItemStatus('error');
    }
  }, [fulfillError, completedError]);

  useEffect(() => {
    if (completeHash) {
      onCompleted?.(completeHash);
    }
  }, [completeHash]);

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
      <div className='mt-8 h-[450px] w-[100%]'>
        <Steps
          navArrowColor={'#FFFFFF'}
          className='h-[400px]'
          direction='vertical'
          //@ts-ignore
          status={itemStatus}
          current={current}
          items={item}
        />
      </div>
    </Modal>
  );
}

export enum StepStatus {
  BeforeOpen,
  WaitingForRandomWords,
  WaitingForExecuteDraws,
  SeeCards,
}
