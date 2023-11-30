import Image from 'next/image';

interface EventItemProps {
  title: string;
  hash: string;
  chain: string;
}
export function EventItem({ title, hash, chain }: EventItemProps) {
  const url = `https://arbiscan.io/tx/${hash}`;
  return (
    <div className='w-[100%]'>
      <div className='inline-flex'>
        <h2>{title}</h2>
        <a href={url}>
          <Image
            src='/etherscan-logo-circle.svg'
            alt='etherscan'
            width={20}
            height={20}
          />
        </a>
      </div>
    </div>
  );
}
