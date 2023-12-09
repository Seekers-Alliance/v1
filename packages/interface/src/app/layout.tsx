import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'antd/dist/reset.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '@/contexts/Providers';
import StyledComponentsRegistry from '@/app/lib/AntdRegistry';
import { ConfigProvider } from 'antd';
import theme from '@/theme/themeConfig';
import { TokenListProvider } from '@/contexts/TokenListProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seekers-Alliance',
  description: 'A Chainlink Hackathon Project on Avalanche',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap'
          rel='stylesheet'
        />
        <title>
          Seekers Alliance | A Chainlink Hackathon Project on Avalanche
        </title>
      </head>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <ConfigProvider theme={theme}>
            <Providers>
              <TokenListProvider>{children}</TokenListProvider>
            </Providers>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
