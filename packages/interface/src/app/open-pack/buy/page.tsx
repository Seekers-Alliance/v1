'use client';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { PrimaryButton, SelectingButton } from '@/components/Button';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import useTxnNotify from '@/hooks/useTxnNotify';
import { TransactionAction } from '@/components/transaction';
import useMarketplaceTxn from '@/hooks/useMarketplaceTxn';
import { useAddresses } from '@/hooks/useAddresses';
import useMarketplaceRead from '@/hooks/useMarketplaceRead';
import usePackPrice from '@/hooks/usePackPrice';
import { formatAmount } from '@/common';
import useWaitForCCIP from '@/hooks/useWaitForCCIP';
import Link from 'next/link';
import {getConfig} from "@/config";

export default function Page() {
  const { marketplaceReceiverAddress } = useAddresses();
  const {packId}=getConfig()
  const networkList = ['AVALANCHE', 'ETHEREUM', 'OPTIMISM'];
  const amountList = [1, 5, 10, 15, 20, 25];
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [selectedToken, setSelectedToken] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [messageId, setMessageId] = useState<string | undefined>(undefined);
  const messageLink= useMemo(() => {
    return `https://ccip.chain.link/msg/${messageId}`;
  }, [messageId]);
  console.log(`messageLink`, messageLink)
  const { data: packPrice, error } = usePackPrice(
      packId,
    getChainId(networkList[selectedNetwork])
  );
  console.log(`packPrice`, packPrice);
  console.log(`packPrice error`, error);
  console.log(`selectedAmount`, amountList[selectedAmount]);
  const nativeCoin = useMemo(() => {
    switch (networkList[selectedNetwork]) {
      case 'AVALANCHE':
        return 'AVAX';
      default:
        return 'ETH';
    }
  }, [selectedNetwork]);
  const totalCost = useMemo(() => {
    let cost = '0';
    let coin = nativeCoin;
    if (selectedToken === 0) {
      coin = nativeCoin;
      cost = formatAmount(
        (packPrice?.native || BigInt(0)) * BigInt(amountList[selectedAmount]),
        18,
        4
      );
    } else {
        coin = 'USDT';
      cost = formatAmount(
        (packPrice?.usdt || BigInt(0)) * BigInt(amountList[selectedAmount]),
        6,
        4
      );
    }
    return `${cost} ${coin}`;
  }, [packPrice, nativeCoin, selectedToken, selectedAmount]);
  const handleMessageId = useCallback((messageId: string) => {
    setMessageId(messageId);
  }, []);
  const handleSelectNetwork = useCallback((index: number) => {
    return () => setSelectedNetwork(index);
  }, []);
  const handleSelectToken = useCallback((index: number) => {
    return () => setSelectedToken(index);
  }, []);
  const handleSelectAmount = useCallback((index: number) => {
    return () => setSelectedAmount(index);
  }, []);
  return (
    <main className='flex min-h-screen bg-black bg-[url("/initial.png")]'>
      <div className='fixed left-[767px] top-[210px]'>
        <div className='flex h-[60px] w-[465px] flex-row gap-4'>
          {networkList.map((item, index) => {
            const selected = index === selectedNetwork;
            return (
              <SelectingButton
                key={index}
                selected={selected}
                onClick={handleSelectNetwork(index)}
              >
                {item}
              </SelectingButton>
            );
          })}
        </div>
      </div>
      <div className='fixed left-[767px] top-[369px]'>
        <div className='flex h-[60px] w-[465px] flex-row gap-4'>
          <SelectingButton
            selected={selectedToken === 0}
            onClick={handleSelectToken(0)}
          >
            <span>{formatAmount(packPrice?.native, 18, 4) + ' '}</span>
            {nativeCoin}
          </SelectingButton>
          <SelectingButton
            selected={selectedToken === 1}
            onClick={handleSelectToken(1)}
          >
            <span>{formatAmount(packPrice?.usdt, 6, 4) + ' '}</span>
            USDT
          </SelectingButton>
        </div>
      </div>
      <div className='fixed left-[767px] top-[451px]'>
        <div className='flex h-[60px] w-[465px] flex-row gap-4'>
          {amountList.map((item, index) => {
            const selected = index === selectedAmount;
            return (
              <SelectingButton
                key={index}
                selected={selected}
                onClick={handleSelectAmount(index)}
              >
                {item}
              </SelectingButton>
            );
          })}
        </div>
      </div>
      <div className='fixed left-[767px] top-[530px]'>
        <div className='flex h-[60px] w-[465px] flex-row justify-between gap-2'>
          <div className='w-[83%]'>
            <BuyStatusButton
              packId={packId}
              network={networkList[selectedNetwork]}
              amount={amountList[selectedAmount]}
              price={packPrice?.native || BigInt(0)}
                onMessageId={handleMessageId}
            >
              BUY | {`${totalCost}`}
            </BuyStatusButton>
          </div>
          <div className='w-[14%]'>
            <div className='flex h-[100%] w-[100%] items-center justify-center rounded-[4px] bg-[#79FFF5]'>
              <Link href={messageLink} target={'_blank'}>
                <img src={'/External-Link.svg'} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function getChainId(network: string): number {
  let chainId = 5;
  switch (network) {
    case 'AVALANCHE':
      chainId = 43113;
      break;
    case 'ETHEREUM':
      chainId = 11155111;
      break;
    case 'OPTIMISM':
      chainId = 420;
      break;
  }
  return chainId;
}

enum BuyStatus {
  BeforeBuy,
  Buy,
  PendingBuy,
  AfterBuy,
}

interface BuyStatusButtonProps {
  onMessageId?: (messageId: string) => void;
  packId: number;
  price: bigint;
  amount: number;
  network: string;
  children?: ReactNode;
}

function BuyStatusButton({
  network,
  amount,
  packId,
  price,
                           onMessageId,
  children,
}: BuyStatusButtonProps) {
  const { marketplaceReceiverAddress } = useAddresses();
  const [status, setStatus] = useState(BuyStatus.BeforeBuy);
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const router = useRouter();
  const [senderHash, setSenderHash] = useState<`0x${string}` | undefined>(
    undefined
  );
  const { handleTxnResponse, contextHolder, api } = useTxnNotify();
  const { isSuccess,isLoading:isCCIPLoading,isError,error,messageId,receiverHash } = useWaitForCCIP(11155111, senderHash);
  const {
    hash,
    submit,
    isSubmitError,
    isSubmitSuccess,
    submitError,
    confirmError,
    isConfirmSuccess,
    isConfirmError,
    isLoading,
    confirmData,
  } = useMarketplaceTxn('purchasePackNative', getChainId(network));
  const handleChainChanged = useCallback(
    (network: string) => {
      let chainId = getChainId(network);
      if (chainId === chain?.id) {
        console.log('same chain');
        return;
      }
      console.log(chainId);
      switchNetwork?.(chainId);
    },
    [switchNetwork, chain]
  );
  const handleBuy = useCallback(() => {
    console.log(`price: ${price}`);
    if (status === BuyStatus.Buy) {
      const value = price * BigInt(amount);
      console.log(`value: ${value}`);
      switch (getChainId(network)) {
        case 43113:
          //@ts-ignore
          submit?.({ args: [packId, amount], value: value });
          break;
        case 11155111:
          submit?.({
            args: [
              BigInt('14767482510784806043'),
              marketplaceReceiverAddress,
              packId,
              amount,
              1,
            ],
            value: value,
          });
          break;
        default:
          submit?.({
            args: [
              BigInt('14767482510784806043'),
              marketplaceReceiverAddress,
              packId,
              amount,
              1,
            ],
            value: value,
          });
      }

      return;
    }
  }, [status]);

  const handleAfterBuy = useCallback(() => {
    if (status === BuyStatus.AfterBuy) {
      router.push('/open-pack/open');
      return;
    }
  }, [status]);
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
    console.log(`confirmData`, confirmData);
    if (confirmData) {
      console.log(`confirmData`, confirmData);
      setSenderHash(confirmData?.transactionHash);
      if (getChainId(network) === 43113) {
        setStatus(BuyStatus.AfterBuy);
      } else {
        setStatus(BuyStatus.PendingBuy);
      }
    }
  }, [confirmData]);

  useEffect(() => {
    if (isSuccess && status === BuyStatus.PendingBuy) {
      setStatus(BuyStatus.AfterBuy);
    }
  }, [status, isSuccess]);

  useEffect(() => {
    if (status === BuyStatus.BeforeBuy) {
      if (isConnected && getChainId(network) === chain?.id) {
        setStatus(BuyStatus.Buy);
      }
    } else {
      if (!isConnected || getChainId(network) !== chain?.id) {
        setStatus(BuyStatus.BeforeBuy);
      }
    }
  }, [status, isConnected, chain, network]);
  useEffect(() => {
    if (messageId){
      console.log(`messageId`, messageId)
      onMessageId?.(messageId);
    }
  }, [messageId]);
  switch (status) {
    case BuyStatus.BeforeBuy:
      return (
        <ConnectWalletButton onAfterConnect={() => handleChainChanged(network)}>
          SWITCH NETWORK
        </ConnectWalletButton>
      );
    case BuyStatus.Buy:
      return (
        <>
          {contextHolder}
          <PrimaryButton loading={isLoading} onClick={handleBuy}>
            {children}
          </PrimaryButton>
        </>
      );
    case BuyStatus.PendingBuy:
      return <PrimaryButton loading={true}>Waiting For CCIP</PrimaryButton>;
    case BuyStatus.AfterBuy:
      return <PrimaryButton onClick={handleAfterBuy}>OPEN PACKS</PrimaryButton>;
  }
}

function generateCCIPLink(address: string): string {
  return `https://ccip.chain.link/address/${address}`;
}
