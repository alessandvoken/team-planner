import '@fontsource-variable/manrope';
import { ToastProvider } from '@heroui/react';
import type { Metadata } from 'next';

import { SiteFooter } from '@/components/layout/footer';
import { SiteHeader } from '@/components/layout/header';
import { themeBootstrap } from '@/components/theme/theme-bootstrap';

import './globals.css';

export const metadata: Metadata = {
  title: 'Team Planner',
  icons: { icon: '/favicon.svg?v=2' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="antialiased">
        <ToastProvider placement="top" className="board-toast-region" />
        <div className="flex min-h-dvh flex-col p-6">
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
