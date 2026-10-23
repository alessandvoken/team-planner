import Image from 'next/image';

import { ThemeSwitch } from '@/components/theme/theme-switch';

export function SiteHeader() {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-separator pb-4">
      <p className="flex items-center gap-3 text-2xl font-medium">
        <Image
          src="/favicon.svg?v=2"
          alt=""
          width={32}
          height={32}
          unoptimized
        />
        Team Planner
      </p>
      <ThemeSwitch />
    </header>
  );
}
