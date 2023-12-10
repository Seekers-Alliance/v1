'use client';
import NFTCard from '@/components/NFTCard';
import { NavButton } from '@/components/Button';
import SimpleNavbar from '@/components/SimpleNavbar';
import { notFound, useRouter } from 'next/navigation';
import Icon from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { NFTProfile2 } from '@/components/NFTProfile';
import { useWaitForTransaction } from 'wagmi';
import { filterERC1155Events } from '@/core/events/erc1155';
import { TransferBatchParams, TransferSingleParams } from '@/core/types';
import { getConfig } from '@/config';

export default function Page({ params }: { params: { slug: string } }) {
  const { openseaCollectionUrl, vrfUrl } = getConfig();
  const router = useRouter();
  const { slug } = params;
  const [tokenList, setTokenList] = useState<bigint[]>([]);
  const { data, error } = useWaitForTransaction({
    hash: slug as `0x${string}`,
    chainId: 43113,
  });

  useEffect(() => {
    if (error) {
      router.push('/_not-found');
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      const tokenBatch = filterERC1155Events('TransferBatch', data.logs);
      const tokenSingle = filterERC1155Events('TransferSingle', data.logs);
      const l = [] as bigint[];
      tokenBatch.forEach((item) => {
        const params = item.args as TransferBatchParams;
        for (let i = 0; i < params.values.length; i++) {
          for (let j = 0; j < params.values[i]; j++) {
            l.push(params.ids[i]);
          }
        }
      });
      tokenSingle.forEach((item) => {
        const params = item.args as TransferSingleParams;
        for (let i = 0; i < params.value; i++) {
          l.push(params.id);
        }
      });
      setTokenList(l);
    }
  }, [data]);

  return (
    <main className='min-h-screen bg-black bg-[url("/repository.png")]'>
      <div className='fixed left-[131px] top-[50px] w-[220px]'>
        <SimpleNavbar />
      </div>
      <div className='fixed left-[650px] top-[51px]'>
        <div className='flex flex-row gap-4'>
          <div className='h-[60px] w-[250px]'>
            <NavButton>
              <a
                href={
                  openseaCollectionUrl ||
                  'https://opensea.io/collection/wagmi-nft'
                }
                target={'_blank'}
              >
                <div className='inline-flex items-center gap-4'>
                  <span>View NFTs on OpenSea</span>
                  <span>
                    <Icon
                      component={() => (
                        <img
                          src={'/External-Link-1.svg'}
                          width={25}
                          height={20}
                        />
                      )}
                    />
                  </span>
                </div>
              </a>
            </NavButton>
          </div>
          <div className='h-[60px] w-[420px]'>
            <NavButton>
              <a href={vrfUrl || ''} target={'_blank'}>
                <div className='inline-flex items-center gap-4'>
                  <span>CHAINLINK VRF TRANSACTION ID TO PROVE FAIRNESS</span>
                  <span>
                    <Icon
                      component={() => (
                        <img
                          src={'/External-Link-1.svg'}
                          width={25}
                          height={20}
                        />
                      )}
                    />
                  </span>
                </div>
              </a>
            </NavButton>
          </div>
        </div>
      </div>
      <div className='w-[100%] p-[193px]'>
        <div className='grid grid-flow-dense grid-cols-5 justify-between'>
          {tokenList.map((item, index) => (
            <div key={index} className='flex flex-col items-center'>
              <NFTProfile2 tokenId={item} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
