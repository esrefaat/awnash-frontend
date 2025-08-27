import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import ClientProviders from '@/components/providers/ClientProviders';
import '../app/globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} antialiased h-full`}>
      <ClientProviders>
        <div className="App dark h-full">
          <Component {...pageProps} />
        </div>
      </ClientProviders>
    </div>
  );
} 