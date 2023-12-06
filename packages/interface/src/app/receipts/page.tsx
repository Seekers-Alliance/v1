'use client';
import NFTCard from '@/components/NFTCard';
import { NavButton } from '@/components/Button';
import SimpleNavbar from '@/components/SimpleNavbar';
import { useRouter } from 'next/navigation';
import Icon from "@ant-design/icons";
import Link from "next/link";
import {useCallback} from "react";
import {NFTProfile2} from "@/components/NFTProfile";

export default function Page() {
  const router = useRouter();
  const toOpensea=useCallback(() => {
            router.push('https://testnets.opensea.io/zh-TW/collection/seekers-alliance');
        }, [router],
  )
  const toVRF=useCallback(() => {
            router.push('https://vrf.chain.link/fuji/822');
        },[router])
  return (
    <main className='min-h-screen bg-black bg-[url("/repository.png")]'>
      <div className='fixed left-[131px] top-[50px] w-[220px]'>
        <SimpleNavbar />
      </div>
      <div className='fixed left-[650px] top-[51px]'>
          <div className='flex flex-row gap-4'>
          <div className='h-[60px] w-[250px]'>
              <NavButton onClick={toOpensea}>
                  <div className='inline-flex items-center gap-4'>
                      <span>View NFTs on OpenSea</span>
                      <span>
                  <Icon
                      component={() => <img src={'/External-Link-1.svg'} width={25} height={20} />}
                  />
                </span>
                  </div>
              </NavButton>
          </div>
        <div className='h-[60px] w-[420px]'>
          <NavButton onClick={toVRF}>
            <div className='inline-flex items-center gap-4'>
              <span>CHAINLINK VRF TRANSACTION ID TO PROVE FAIRNESS</span>
              <span>
                  <Icon
                      component={() => <img src={'/External-Link-1.svg'} width={25} height={20} />}
                  />
                </span>
            </div>
          </NavButton>
        </div>
          </div>
      </div>
      <div className='w-[100%] p-[193px]'>
        <div className='grid grid-flow-dense grid-cols-5 justify-between'>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className='flex flex-col items-center'>
                  <NFTProfile2 tokenId={BigInt(1)} />
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
