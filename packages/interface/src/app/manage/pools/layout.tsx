'use client';
import {Layout} from 'antd';
import PoolProcessHeader from "@/components/PoolProcessHeader";
import Link from "next/link";
import PoolProcessSider from "@/components/PoolProcessSider";

const { Content } = Layout;

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className='flex justify-between bg-gray-800'>
        <PoolProcessSider/>
        <Layout className='flex justify-between bg-gray-800'>
            <PoolProcessHeader/>
            <Content style={{ margin: '24px 16px 0' }}>
                {children}
            </Content>
        </Layout>

    </Layout>
  );
}
