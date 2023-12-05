import React from 'react';
import useSWR from 'swr';

interface NFTProfileProps {
  tokenId: bigint;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const IPFS_URL = 'https://ipfs.io/ipfs';
export default function NFTProfile({ tokenId }: NFTProfileProps) {
  const url = `${IPFS_URL}/Qmai4otFNrv3b1Qm3h3rb2neosrcHneRLdCsbwUv3V5sy4/${tokenId.toString()}.json`;
  const { data } = useSWR(url, fetcher);
  const [imgUrl, setImgUrl] = React.useState('');
  React.useEffect(() => {
    if (data) {
      setImgUrl(convertImgUrl(data.image));
    }
  }, [data]);
  return (
    <>
      <div className="font-['Space Grotesk'] mt-1 w-[100%] px-2 text-[12px] font-bold uppercase text-white">
        {`ID-${tokenId.toString().padStart(3, '0')}`}
      </div>
      <img src={imgUrl} alt={`ID-${tokenId.toString().padStart(3, '0')}`} />
    </>
  );
}

function convertImgUrl(url: string) {
  return url.replace('ipfs://', IPFS_URL + '/');
}
