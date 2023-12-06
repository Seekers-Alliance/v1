'use client';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { PrimaryButton } from '@/components/Button';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { useRouter } from 'next/navigation';
import useDrawingRead from '@/hooks/useDrawingRead';
import useTxnNotify from '@/hooks/useTxnNotify';
import useDrawingTxn from '@/hooks/useDrawingTxn';
import { TransactionAction } from '@/components/transaction';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { useAddresses } from '@/hooks/useAddresses';
import OpenStepModal from "@/components/OpenStepModal";
import {filterDrawingEvents} from "@/core/events/drawing";

export default function Page() {
  const { address } = useAccount();
  const { data } = useDrawingRead('usersDrawable', [address, 0]);
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
            packId={0}
            poolAmount={poolAmount}
          >{`OPEN ${packAmount} PACKS*`}</OpenPackButton>
          <OpenPackButton packId={1} poolAmount={1}>
            {'OPEN SPECIAL PACK'}
          </OpenPackButton>
        </div>
      </div>
    </main>
  );
}

interface OpenPackButtonProps {
  packId: number;
  poolAmount: number;
  children?: ReactNode;
}

function OpenPackButton({ packId, poolAmount, children }: OpenPackButtonProps) {
  const { marketplaceReceiverAddress } = useAddresses();
  const [status, setStatus] = useState(OpenStatus.BeforeOpen);
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const router = useRouter();
  const { handleTxnResponse, contextHolder, api } = useTxnNotify();
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
    submit?.({ args: [[packId], [poolAmount]] });
    // setStatus(OpenStatus.WaitingForRandomWords);
  }, [submit]);

  const handleOpenPopup = useCallback(() => {
    setOpenModalVisible(true)
    setStatus(OpenStatus.AfterOpen)
  }, []);
  const handleClosePopup = useCallback(() => {
    setOpenModalVisible(false)
  }, []);

  const handleAfterOpening = useCallback(() => {
    router.push('/open-pack/opening');
  }, [submit]);

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
      const event = filterDrawingEvents(
        'RequestSent',
        confirmData.logs
      );
      console.log(`event: ${event}`);
      if (event) {
        //@ts-ignore
        setRequestId(event.args.requestId);
        setStatus(OpenStatus.WaitingForRandomWords);
        //@ts-ignore
        console.log(`requestId: ${event.args.requestId}`);
      }
    }
  }, [confirmData]);

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
    case OpenStatus.RandomWordsReceived:
    case OpenStatus.WaitingForRandomWords:
      return (
          <>
            {contextHolder}
            <PrimaryButton onClick={handleOpenPopup}>
              WAITING
            </PrimaryButton>
            <OpenStepModal open={openModalVisible} onOk={handleClosePopup} onCancel={handleClosePopup}/>
          </>
      );
    case OpenStatus.AfterOpen:
      return <PrimaryButton onClick={handleAfterOpening}>SEE CARDS</PrimaryButton>;
  }
}

enum OpenStatus {
  BeforeOpen,
  Open,
  WaitingForRandomWords,
    RandomWordsReceived,
  AfterOpen,
}
