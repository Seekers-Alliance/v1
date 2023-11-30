'use client';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, MenuProps } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { CSSProperties } from 'react';
import { HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const items1: MenuProps['items'] = ['1', '2', '3'].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  // textAlign: 'center',
  // color: '#fff',
  // height: 64,
  // paddingInline: 50,
  // lineHeight: '64px',
  // backgroundColor: '#7dbcea',
};
export default function NavBar() {
  const items = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link href={'/'}>Home</Link>,
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: <Link href={'/draw'}>Draw</Link>,
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: <Link href={'/pack'}>Pack</Link>,
    },
    {
      key: '4',
      icon: <UserOutlined />,
      label: <Link href={'/analytics'}>Analytics</Link>,
    },
    {
      key: '5',
      icon: <UserOutlined />,
      label: <Link href={'/profile'}>Profile</Link>,
    },
  ];

  return (
    <Header style={headerStyle}>
      <div className='inline-flex items-center' style={{ color: 'white' }}>
        <img
          src='/opensea.svg'
          className='mr-3 h-6 sm:h-9'
          alt='Flowbite React Logo'
        />
        <span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white'>
          Seekers
        </span>
      </div>
      <div
        className='inline-flex items-center gap-2'
        style={{ color: 'white' }}
      >
        <Menu theme='dark' mode='horizontal' items={items} />
        <ConnectButton />
      </div>
    </Header>
  );
}
