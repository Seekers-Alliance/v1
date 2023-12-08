'use client';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { PrimaryButton } from '@/components/Button';
import {
  useAccount,
  useContractEvent,
  useNetwork,
  usePublicClient,
  useSwitchNetwork,
} from 'wagmi';
import { useRouter } from 'next/navigation';
import useDrawingRead from '@/hooks/useDrawingRead';
import useTxnNotify from '@/hooks/useTxnNotify';
import useDrawingTxn from '@/hooks/useDrawingTxn';
import { TransactionAction } from '@/components/transaction';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import OpenStepsModal from '@/components/OpenStepsModal';
import { filterDrawingEvents } from '@/core/events/drawing';
import { RequestSentParams } from '@/core/types';
import { getConfig } from '@/config';

export default function Page() {
  const { address } = useAccount();
  const { packId, specialPackId, drawingPoolId, specialDrawingPoolId } =
    getConfig();
  const { data } = useDrawingRead('usersDrawable', [address, drawingPoolId]);
  const [poolAmount, setPoolAmount] = useState<number>(0);
  const packAmount = useMemo(() => {
    return poolAmount / 5;
  }, [poolAmount]);
  useEffect(() => {
    if (data) {
      setPoolAmount(data);
    }
  }, [data]);
  return (
    <main className='flex min-h-screen bg-black bg-[url("/purchase.png")]'>
      <div className='fixed left-[529px] top-[486px]'>
        <div className='flex h-[140px] w-[383px] flex-col justify-between gap-4'>
          <OpenPackButton
            packId={packId}
            poolAmount={poolAmount}
            packAmount={packAmount}
          >{`OPEN ${packAmount} PACKS*`}</OpenPackButton>
          <OpenPackButton packId={specialPackId} poolAmount={5} packAmount={1}>
            {'OPEN SPECIAL PACK'}
          </OpenPackButton>
        </div>
      </div>
    </main>
  );
}

interface OpenPackButtonProps {
  packId: number;
  packAmount: number;
  poolAmount: number;
  children?: ReactNode;
}

function OpenPackButton({
  packAmount,
  packId,
  poolAmount,
  children,
}: OpenPackButtonProps) {
  const [status, setStatus] = useState(OpenStatus.WaitingForRandomWords);
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [requestId, setRequestId] = useState<bigint | undefined>(undefined);
  const router = useRouter();
  const { handleTxnResponse, contextHolder, api } = useTxnNotify();
  const [waitingMsg, setWaitingMsg] = useState<string>();
  const [completeHash, setCompleteHash] = useState<string | undefined>(
    '0x445f4274aef2f538287cce24663922e0d2ad3bf9a22c1e9c7acebe19e272aff1'
  );
  const {
    hash,
    submit,
    isSubmitError,
    isSubmitSuccess,
    submitError,
    confirmError,
    isConfirmSuccess,
    isConfirmError,
    confirmData,
    isLoading,
  } = useDrawingTxn('sendRequest');

  const handleChainChanged = useCallback(() => {
    if (chain?.id === 43113) {
      console.log('same chain');
      return;
    }
    switchNetwork?.(43113);
  }, [switchNetwork, chain]);

  const handleOpenPack = useCallback(() => {
    console.log('open');
    setOpenModalVisible(true);
    submit?.({ args: [[packId], [poolAmount]] });
    // setStatus(OpenStatus.WaitingForRandomWords);
  }, [submit]);

  const handleOpenPopup = useCallback(() => {
    setOpenModalVisible(true);
    // setStatus(OpenStatus.AfterOpen)
  }, []);
  const handleClosePopup = useCallback(() => {
    setOpenModalVisible(false);
  }, []);

  const handleAfterOpening = useCallback(() => {
    const url = `/open-pack/opening?hash=${completeHash}`;
    router.push(url);
  }, [completeHash]);

  const handleComplete = useCallback((hash: `0x${string}`) => {
    if (hash) {
      setStatus(OpenStatus.AfterOpen);
      setCompleteHash(hash);
    }
  }, []);

  useEffect(() => {
    handleTxnResponse(
      TransactionAction.SUBMIT,
      isSubmitError,
      isSubmitSuccess,
      submitError
    );
  }, [isSubmitError, isSubmitSuccess, submitError]);
  useEffect(() => {
    handleTxnResponse(
      TransactionAction.CONFIRM,
      isConfirmError,
      isConfirmSuccess,
      confirmError
    );
  }, [isConfirmError, isConfirmSuccess, confirmError]);

  useEffect(() => {
    if (status === OpenStatus.BeforeOpen) {
      if (isConnected && chain?.id === 43113) {
        setStatus(OpenStatus.Open);
      }
    } else {
      if (!isConnected || chain?.id !== 43113) {
        setStatus(OpenStatus.BeforeOpen);
      }
    }
  }, [status, isConnected, chain]);

  useEffect(() => {
    if (isConfirmSuccess) {
      setStatus(OpenStatus.WaitingForRandomWords);
    }
  }, [isConfirmSuccess]);

  useEffect(() => {
    if (confirmData) {
      const event = filterDrawingEvents('RequestSent', confirmData.logs);
      console.log(`event:`, event);
      if (event) {
        setRequestId((event.args as RequestSentParams).requestId);
        setStatus(OpenStatus.WaitingForRandomWords);
        //@ts-ignore
        console.log(`requestId: ${event.args.requestId}`);
      }
    }
  }, [confirmData]);

  useEffect(() => {
    switch (status) {
      case OpenStatus.WaitingForRandomWords:
        setWaitingMsg('waiting for random words');
        break;
      case OpenStatus.WaitingForExecution:
        setWaitingMsg('waiting for execution');
        break;
      case OpenStatus.AfterOpen:
        setWaitingMsg('see cards');
        break;
      default:
        setWaitingMsg('unknown');
    }
  }, [status]);
  switch (status) {
    case OpenStatus.BeforeOpen:
      return (
        <ConnectWalletButton onAfterConnect={handleChainChanged}>
          SWITCH NETWORK
        </ConnectWalletButton>
      );
    case OpenStatus.Open:
      return (
        <>
          {contextHolder}
          <PrimaryButton loading={isLoading} onClick={handleOpenPack}>
            {children}
          </PrimaryButton>
        </>
      );
    case OpenStatus.WaitingForExecution:
    case OpenStatus.WaitingForRandomWords:
      return (
        <>
          {contextHolder}
          <PrimaryButton onClick={handleOpenPopup}>{waitingMsg}</PrimaryButton>
          <OpenStepsModal
            requestId={requestId}
            open={openModalVisible}
            onOk={handleClosePopup}
            onCancel={handleClosePopup}
            onCompleted={handleComplete}
            amount={packAmount}
          />
        </>
      );
    case OpenStatus.AfterOpen:
      return (
        <PrimaryButton onClick={handleAfterOpening}>{waitingMsg}</PrimaryButton>
      );
  }
}

enum OpenStatus {
  BeforeOpen,
  Open,
  WaitingForRandomWords,
  WaitingForExecution,
  AfterOpen,
}
