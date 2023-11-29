'use client';
import { Card } from 'antd';
import Meta from 'antd/es/card/Meta';

interface NFTCardProps {
  width?: number;
  height?: number;
}

export default function NFTCard({ width = 350, height = 350 }: NFTCardProps) {
  return (
    <img
      alt='example'
      // src='https://voxies-data-final.s3.us-east-2.amazonaws.com/1.gif'
      src='/Bubble%20Gunner.png'
      width={width}
      height={height}
    />
  );
  // return (
  //   <Card
  //     className='max-w-sm'
  //     cover={
  //       <img
  //         alt='example'
  //         // src='https://voxies-data-final.s3.us-east-2.amazonaws.com/1.gif'
  //           src='/Bubble%20Gunner.png'
  //       />
  //     }
  //   >
  //     {/*<Meta*/}
  //     {/*  title='Voxie #1'*/}
  //     {/*  description='This is a description of the Voxie #1'*/}
  //     {/*/>*/}
  //   </Card>
  // );
}
