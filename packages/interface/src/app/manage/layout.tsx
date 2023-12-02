'use client';
import { Layout } from 'antd';

const { Footer } = Layout;

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className='flex min-h-screen justify-between bg-gray-800'>
      {children}
      <Footer className='inline-flex h-[100%] w-[100%] items-center justify-center bg-gray-900 py-5'>
        <div className="font-['Source Sans Pro'] w-64 text-center text-sm font-normal leading-normal text-white">
          © 2023 Seeker Alliance
        </div>
      </Footer>
    </Layout>
  );
}
