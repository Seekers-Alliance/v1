'use client';
import { Descriptions, Steps } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePublicClient } from 'wagmi';
import {
  EventData,
  getRandomWordsFulfilledEventsByRequestIds,
  getRequestCompletedEventsByRequestIds,
  RandomWordsFulfilledParams,
  RequestCompletedParams,
  watchRandomWordsFulfilledEventsByRequestIds,
  watchRequestCompletedEventsByRequestIds,
} from '@/core/event';
import { formatHex, getSupportedChainId } from '@/common';
import { LinkOutlined } from '@ant-design/icons';
import { useAddresses } from '@/hooks/useAddresses';
import useWaitRequestSent from '@/hooks/useWaitRequestSent';
import { listenEvent } from '@/utils/process';

const TX_HASH =
  '0x30fa2954952af067542f4ccdb665770307edd34fe7e4c625ce08d8da28749557';

enum OpeningStatus {
  START,
  DREW,
  FULFILLED,
  RECEIVED,
}

export function OpeningSteps() {
  const unwatchFulfilled = useRef<() => void>();
  const [status, setStatus] = useState<OpeningStatus>(OpeningStatus.START);
  const [blockNumberForDrew, setBlockNumberForDrew] = useState<bigint | null>(
    null
  );
  const [requestId, setRequestId] = useState<bigint | null>(null);
  const [fulfillTxnHash, setFulfillTxnHash] = useState<string | null>(null);
  const chainId = getSupportedChainId();
  const client = usePublicClient({ chainId });
  const {
    isLoading,
    error,
    data: requestSentEvent,
  } = useWaitRequestSent(TX_HASH);
  const { vrfAddress, fomoAddress } = useAddresses();
  const getCurrent = useCallback(() => {
    switch (status) {
      case OpeningStatus.START:
        return 0;
      case OpeningStatus.DREW:
        return 1;
      case OpeningStatus.FULFILLED:
        return 2;
      case OpeningStatus.RECEIVED:
        return 3;
      default:
        return 0;
    }
  }, [status]);

  const getFnForFulfilledEvent = useCallback(async () => {
    if (requestId && blockNumberForDrew) {
      const blockInterval = BigInt(100);
      const newBlockNumber = await client.getBlockNumber();
      const toBlock =
        newBlockNumber - blockInterval > blockNumberForDrew
          ? blockNumberForDrew + blockInterval
          : newBlockNumber;
      return await getRandomWordsFulfilledEventsByRequestIds(client, {
        fromBlock: blockNumberForDrew,
        toBlock: toBlock,
        args: {
          requestId: [requestId],
        },
        address: vrfAddress,
      });
    }
    return [];
  }, [client, vrfAddress, requestId, blockNumberForDrew]);

  const waitFnForFulfilledEvent = useCallback(
    (listener: (e: EventData<RandomWordsFulfilledParams>) => void) => {
      if (requestId && blockNumberForDrew) {
        return watchRandomWordsFulfilledEventsByRequestIds(
          client,
          vrfAddress,
          [requestId],
          listener
        );
      }
    },
    [client, vrfAddress, requestId]
  );

  const getFnForCompletedEvent = useCallback(async () => {
    if (requestId && blockNumberForDrew) {
      const blockInterval = BigInt(1000);
      const newBlockNumber = await client.getBlockNumber();
      const toBlock =
        newBlockNumber - blockInterval > blockNumberForDrew
          ? blockNumberForDrew + blockInterval
          : newBlockNumber;
      console.log('getFnForCompletedEvent', requestId);
      const d = await getRequestCompletedEventsByRequestIds(client, {
        fromBlock: blockNumberForDrew,
        toBlock: toBlock,
        args: {
          requestId: [requestId],
        },
        address: fomoAddress,
      });
      console.log('getFnForCompletedEvent', d);
      return d;
    }
    return [];
  }, [client, fomoAddress, requestId, blockNumberForDrew]);

  const waitFnForCompletedEvent = useCallback(
    (listener: (e: EventData<RequestCompletedParams>) => void) => {
      if (requestId && blockNumberForDrew) {
        return watchRequestCompletedEventsByRequestIds(
          client,
          fomoAddress,
          [requestId],
          listener
        );
      }
    },
    [client, fomoAddress, requestId]
  );

  const handleFulfilled = (hash: string) => {
    setFulfillTxnHash(hash);
    setStatus(OpeningStatus.FULFILLED);
  };

  const handleRequestRent = (blockNumber: bigint, questionId: bigint) => {
    setBlockNumberForDrew(blockNumber);
    setRequestId(questionId);
    setStatus(OpeningStatus.DREW);
  };

  useEffect(() => {
    if (status !== OpeningStatus.START) {
      return;
    }
    if (requestSentEvent) {
      handleRequestRent(
        requestSentEvent.blockNumber,
        requestSentEvent.args.requestId
      );
    }
  }, [status, requestSentEvent]);

  useEffect(() => {
    if (status !== OpeningStatus.DREW) {
      return;
    }
    const onListen = (e: EventData<RandomWordsFulfilledParams>) => {
      console.log('watched event fired for fulfill');
      handleFulfilled(e.transactionHash as `0x${string}`);
    };
    listenEvent({
      getFn: getFnForFulfilledEvent,
      waitFn: waitFnForFulfilledEvent,
      onListen: onListen,
    })
      .then(() => console.log('wait for fulfilled'))
      .catch((err) => console.log(`err:${err}`));
  }, [status, requestId]);

  useEffect(() => {
    if (status !== OpeningStatus.FULFILLED) {
      return;
    }
    const onListen = (e: EventData<RequestCompletedParams>) => {
      console.log('watched event fired for completed');
      console.log(e);
      // handleFulfilled(e.transactionHash as `0x${string}`);
    };
    listenEvent({
      getFn: getFnForCompletedEvent,
      waitFn: waitFnForCompletedEvent,
      onListen: onListen,
    })
      .then(() => console.log('wait for completed'))
      .catch((err) => console.log(`err:${err}`));
  }, [status, requestId]);

  // useEffect(() => {
  //   if (status === OpeningStatus.START) {
  //     setTimeout(() => {
  //       setStatus(OpeningStatus.DREW);
  //     }, 5 * 1000);
  //   } else if (status === OpeningStatus.DREW) {
  //     setTimeout(() => {
  //       setStatus(OpeningStatus.FULFILLED);
  //     }, 5 * 1000);
  //   } else if (status === OpeningStatus.FULFILLED) {
  //     setTimeout(() => {
  //       setStatus(OpeningStatus.RECEIVED);
  //     }, 5 * 1000);
  //   }
  // }, [status]);

  return (
    <Steps
      current={getCurrent()}
      items={[
        {
          title: 'Drew the Card',
          description: (
            <div className='my-2'>
              <Descriptions column={1} layout='vertical'>
                <Descriptions.Item label='RequestId'>
                  <div className='flex'>
                    <span>
                      {requestId
                        ? requestId.toString()
                        : 'wait for request'}
                    </span>
                    <a href={'https://vrf.chain.link/arbitrum/127'}>
                      <LinkOutlined />
                    </a>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          ),
        },
        {
          title: 'Fulfilled the Random Word',
          description: (
            <div className='my-2'>
              <Descriptions column={1} layout='vertical'>
                <Descriptions.Item label='TxnHash'>
                  <div className='flex'>
                    <span>
                      {fulfillTxnHash
                        ? formatHex(fulfillTxnHash)
                        : 'wait for request'}
                    </span>
                    <a
                      href={
                        fulfillTxnHash ? getTxnUrl(chainId, fulfillTxnHash) : ''
                      }
                    >
                      <LinkOutlined />
                    </a>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          ),
        },
        {
          title: 'Received the NFT',
          description: (
            <div className='my-2'>
              <Descriptions column={1} layout='vertical'>
                <Descriptions.Item label='TxnHash'>
                  <div className='flex'>
                    <span>
                      {fulfillTxnHash
                        ? formatHex(fulfillTxnHash)
                        : 'wait for request'}
                    </span>
                    <a
                      href={
                        fulfillTxnHash ? getTxnUrl(chainId, fulfillTxnHash) : ''
                      }
                    >
                      <LinkOutlined />
                    </a>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          ),
        },
      ]}
    />
  );
}

function getTxnUrl(chainId: number, txnHash: string): string {
  switch (chainId) {
    case 1:
      return `https://etherscan.io/tx/${txnHash}`;
    case 4:
      return `https://rinkeby.etherscan.io/tx/${txnHash}`;
    case 5:
      return `https://goerli.etherscan.io/tx/${txnHash}`;
    case 42:
      return `https://kovan.etherscan.io/tx/${txnHash}`;
    case 137:
      return `https://polygonscan.com/tx/${txnHash}`;
    case 80001:
      return `https://mumbai.polygonscan.com/tx/${txnHash}`;
    case 43113:
      return `https://testnet.snowtrace.io/tx/${txnHash}`;
    default:
      return `https://etherscan.io/tx/${txnHash}`;
  }
}
