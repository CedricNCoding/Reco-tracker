'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, TrendingUp, ClipboardList, Settings } from 'lucide-react';

const tabs = [
  { href: '/today', label: "Aujourd'hui", icon: CalendarCheck },
  { href: '/progress', label: 'Progression', icon: TrendingUp },
  { href: '/review', label: 'Bilan', icon: ClipboardList },
  { href: '/settings', label: 'Reglages', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-white/10 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-accent-green'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
