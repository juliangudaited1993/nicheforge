'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  CreditCard,
  Plus,
  Flame,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Saved Reports', icon: FileText },
  { href: '/new-report', label: 'New Report', icon: Plus },
  { href: '/alerts', label: 'Trend Alerts', icon: Bell },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="hidden w-64 flex-col border-r border-[#27272a] bg-[#121214] lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-[#27272a] px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#b45309]">
            <Flame className="h-4.5 w-4.5 text-black" />
          </div>
          <div>
            <div className="font-semibold tracking-tighter">ResearchForge</div>
            <div className="text-[10px] text-[#a1a1aa] -mt-1">AI</div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#f59e0b] text-black'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1d] hover:text-[#ededed]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-[#27272a] p-4 text-xs text-[#a1a1aa]">
        <div className="truncate font-mono">{user.email}</div>
        <div className="mt-1 text-[10px]">Free Plan • 5 reports/mo</div>
      </div>
    </div>
  );
}
