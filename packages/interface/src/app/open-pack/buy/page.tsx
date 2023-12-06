'use client';
import {useCallback, useEffect, useMemo, useState} from 'react';
import { PrimaryButton, SelectingButton } from '@/components/Button';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import useTxnNotify from "@/hooks/useTxnNotify";
import {TransactionAction} from "@/components/transaction";
import useMarketplaceTxn from "@/hooks/useMarketplaceTxn";
import {useAddresses} from "@/hooks/useAddresses";
import useMarketplaceRead from "@/hooks/useMarketplaceRead";
import usePackPrice from "@/hooks/usePackPrice";
import {formatAmount} from "@/common";

export default function Page() {
  const networkList = ['AVALANCHE', 'ETHEREUM', 'OPTIMISM'];
  const amountList = [1, 5, 10, 15, 20, 25];
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [selectedToken, setSelectedToken] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const {data:packPrice,error}=usePackPrice(0,getChainId(networkList[selectedNetwork]))
  console.log(`packPrice`,packPrice)
  console.log(`packPrice error`,error)
  const nativeCoin=useMemo(()=>{
    switch (networkList[selectedNetwork]) {
      case 'AVALANCHE':
        return 'AVAX'
      default:
        return 'ETH'
    }
  },[selectedNetwork])
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
                selected={selectedToken===0}
                onClick={handleSelectToken(0)}
              >
                <span>{formatAmount(packPrice?.native,18,4)+" "}</span>
                {nativeCoin}
              </SelectingButton>
          <SelectingButton
              selected={selectedToken===1}
              onClick={handleSelectToken(1)}
          >
            <span>{formatAmount(packPrice?.usdt,6,4)+" "}</span>
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
            <BuyStatusButton packId={0} network={networkList[selectedNetwork]} amount={amountList[selectedAmount]} />
          </div>
          <div className='w-[14%]'>
            <div className='flex h-[100%] w-[100%] items-center justify-center rounded-[4px] bg-[#79FFF5]'>
              <img src={'/External-Link.svg'} />
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
  AfterBuy,
}

interface BuyStatusButtonProps {
  packId: number;
  amount: number;
  network: string;
}

function BuyStatusButton({ network,amount,packId }: BuyStatusButtonProps) {
  const {marketplaceReceiverAddress}=useAddresses()
  const [status, setStatus] = useState(BuyStatus.BeforeBuy);
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const router = useRouter();
  const {data:price}=useMarketplaceRead('getPackConvertedNativePrice',[packId],getChainId(network))
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
    isLoading,
      confirmData
  } = useMarketplaceTxn('purchasePackNative',getChainId(network));
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
    console.log(`price: ${price}`)
    if (status === BuyStatus.Buy) {
      switch (getChainId(network)) {
        case 43113:
          //@ts-ignore
          submit?.({args: [packId,amount],value:price});
          break;
        case 11155111:
            submit?.({args: [BigInt('14767482510784806043'),marketplaceReceiverAddress,packId,amount,1],value:price});
            break;
        default:
            submit?.({args: [BigInt('14767482510784806043'),marketplaceReceiverAddress,packId,amount,1],value:price});
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
    console.log(`confirmData`,confirmData)
    if (confirmData){
      console.log(`confirmData`,confirmData)
        setStatus(BuyStatus.AfterBuy);
    }
  }, [confirmData]);

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
            <PrimaryButton loading={isLoading} onClick={handleBuy}>BUY</PrimaryButton>
          </>
      );
    case BuyStatus.AfterBuy:
      return <PrimaryButton onClick={handleAfterBuy}>OPEN PACKS</PrimaryButton>;
  }
}
