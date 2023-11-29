'use client';
import React, { useEffect, useState } from 'react';
import { EventItem } from '@/components/EventItem';
import {
  useContractEvent,
  usePublicClient,
  useQueryClient,
  useWalletClient,
} from 'wagmi';
import VRFCOORDINATOR_V2_ABI from '@/abis/VRFCoordinatorV2.json';
import { getRandomWordsFulfilledEventsByRequestIds } from '@/core/event';

export function EventList() {
  const [questions, setQuestions] = useState<bigint[]>([]);
  const chainId = 42161;
  const [textHashes, setTextHashes] = useState<string[]>([]);
  const config = {
    address: '0x41034678D6C633D8a95c75e1138A360a28bA15d1' as `0x${string}`,
    eventName: 'RandomWordsFulfilled',
    chainId: chainId,
    abi: VRFCOORDINATOR_V2_ABI,
  };
  const listen = (log: any) => {
    console.log(log);
  };

  const handleEvent = (h: string[], q: bigint[]) => {
    console.log(q);
    setTextHashes(h);
    setQuestions(q);
    console.log(questions);
  };

  const client = usePublicClient({ chainId });
  useEffect(() => {
    getRandomWordsFulfilledEventsByRequestIds(client, {
      fromBlock: BigInt(152226686),
      args: {
        requestId: [
          BigInt(
            '98599149843400981612537610211118353096917668391865998702072436332941737068131'
          ),
          // BigInt(
          //     '29327269785386782027794921876338282194542055605720032989604762526824345112907'
          // ),
        ],
      },
      ...config,
    })
      .then((x) => {
        console.log(x);
        let resQ = [];
        let resH = [];
        for (const y of x) {
          resH.push(y.transactionHash);
          //@ts-ignore
          resQ.push(y.args['requestId'] as bigint);
        }
        handleEvent(resH, resQ);
      })
      .catch((err) => console.log(`err:${err}`));
    // client
    //   .getContractEvents({
    //     fromBlock: BigInt(149936014),
    //     args: {
    //       requestId: [
    //         BigInt(
    //           '17092716955707327871325177501074929338554149104055249355298412624460991945473'
    //         ),
    //         BigInt(
    //           '29327269785386782027794921876338282194542055605720032989604762526824345112907'
    //         ),
    //       ],
    //     },
    //     ...config,
    //   })
    //   .then((x) => {
    //     console.log(x);
    //     let resQ = [];
    //     let resH = [];
    //     for (const y of x) {
    //       resH.push(y.transactionHash);
    //       //@ts-ignore
    //       resQ.push(y.args['requestId'] as bigint);
    //     }
    //     handleEvent(resH, resQ);
    //   })
    //   .catch((err) => console.log(`err:${err}`));
  }, []);
  // const unwatch=useContractEvent({...config,listener:listen})
  return (
    <div className='flex flex-col'>
      {questions.map((q, index) => (
        <EventItem
          key={index}
          title={q.toString()}
          hash={textHashes[index]}
          chain={'arbitrum'}
        />
      ))}
    </div>
  );
}
