import { Link, useLocation } from 'react-router-dom';
import { CalendarCheck, TrendingUp, ClipboardList, Dumbbell, Settings } from 'lucide-react';

const tabs = [
  { href: '/today', label: "Aujourd'hui", icon: CalendarCheck },
  { href: '/progress', label: 'Progres', icon: TrendingUp },
  { href: '/program', label: 'Programme', icon: Dumbbell },
  { href: '/review', label: 'Bilan', icon: ClipboardList },
  { href: '/settings', label: 'Reglages', icon: Settings },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.04] safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'text-accent-green'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={21} strokeWidth={isActive ? 2.2 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-0 w-8 h-0.5 rounded-full bg-accent-green/60" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
