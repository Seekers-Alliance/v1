'use client';
import NFTCard from '@/components/NFTCard';
import { NavButton } from '@/components/Button';
import SimpleNavbar from '@/components/SimpleNavbar';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <main className='min-h-screen bg-black bg-[url("/repository.png")]'>
      <div className='fixed left-[131px] top-[50px] w-[220px]'>
        <SimpleNavbar />
      </div>
      <div className='fixed left-[849px] top-[51px]'>
        <div className='h-[60px] w-[463px]'>
          <NavButton>
            <div className='inline-flex items-center gap-4'>
              <span>CHAINLINK VRF TRANSACTION ID TO PROVE FAIRNESS</span>
              {/*<span>*/}
              <span className='flex items-center justify-center rounded-[4px]'>
                <img src={'/External-Link-1.svg'} width={36} height={36} />
              </span>
            </div>
          </NavButton>
        </div>
      </div>
      <div className='w-[100%] p-[193px]'>
        <div className='grid grid-flow-dense grid-cols-5 justify-between'>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className='flex flex-col items-center'>
                <NFTCard width={500} height={500} />
                <div className=''>
                  <span className="font-['Space Grotesk'] text-[22px] font-normal uppercase text-white">
                    ID{' '}
                  </span>
                  <span className="font-['Space Grotesk'] text-[22px] font-bold uppercase text-white">
                    100
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
