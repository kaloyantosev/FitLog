'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Dumbbell, 
  Flame, 
  LineChart, 
  LayoutDashboard, 
  ShieldCheck, 
  User, 
  ChevronRight,
  Sparkles,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { UserProfile } from '@/types';
import NotificationSettingsModal from './NotificationSettingsModal';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCoachMode, setIsCoachMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/user')
      .then((res) => {
        if (res.status === 401) {
          if (pathname !== '/register' && pathname !== '/login') {
            window.location.href = '/register';
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setUser(data);
          setIsCoachMode(data.role === 'COACH');
        }
      })
      .catch((err) => console.error(err));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fitlog_user_id');
        localStorage.removeItem('fitlog_user_email');
      }
      window.location.href = '/register';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleRole = async () => {
    const nextRole = isCoachMode ? 'CLIENT' : 'COACH';
    setIsCoachMode(!isCoachMode);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        setUser(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { href: '/', label: 'Табло', icon: LayoutDashboard },
    { href: '/workouts', label: 'Тренировки', icon: Dumbbell },
    { href: '/nutrition', label: 'Хранене и макроси', icon: Flame },
    { href: '/progress', label: 'Прогрес и чек-ин', icon: LineChart },
  ];

  if (isCoachMode) {
    navLinks.push({ href: '/coach', label: 'Треньорско студио', icon: ShieldCheck });
  }

  const isAuthPage = pathname === '/register' || pathname === '/login';

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-[#090a0f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/register" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 border border-blue-500/30 flex items-center justify-center font-bold text-lg text-white shadow-inner group-hover:border-blue-400/50 transition-all">
                <Dumbbell className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
                  FitLog
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 font-medium tracking-wide">
                  Personal Coach
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium hidden sm:inline">
                Персонален AI треньор и портал за хранене
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-[#090a0f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Brand: FitLog */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 border border-blue-500/30 flex items-center justify-center font-bold text-lg text-white shadow-inner group-hover:border-blue-400/50 transition-all">
                  <Dumbbell className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
                    FitLog
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5 font-medium tracking-wide">
                    {isCoachMode ? 'FitLog Треньор' : 'Personal Coach'}
                  </span>
                </div>
              </Link>

              {/* Navigation links in Bulgarian */}
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-surface-2 text-white shadow-sm'
                          : 'text-text-muted hover:text-white hover:bg-surface-1'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-text-muted'}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side: Notification Icon, Switch Mode & Profile Name */}
            <div className="flex items-center gap-3">
              {/* Notification Settings Bell Icon */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="relative p-2 rounded-xl bg-surface-1 hover:bg-surface-2 border border-border text-text-muted hover:text-white transition-all"
                title="Настройки за известяване и напомняне"
              >
                <Bell className="w-4 h-4" />
                {user?.emailNotificationsEnabled && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#090a0f]" />
                )}
              </button>

              {/* Coach / Athlete Mode Toggle */}
              <button
                onClick={toggleRole}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-1 hover:bg-surface-2 border border-border text-xs font-medium text-text-secondary transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{isCoachMode ? 'Треньор' : 'Атлет'}</span>
              </button>

              {/* Top right Profile: Just the person's name */}
              <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'А'}
                </div>
                <span className="text-sm font-semibold text-white hidden sm:inline">
                  {user?.name || 'Атлет'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 ml-1 rounded-lg bg-surface-1 hover:bg-red-500/10 border border-border hover:border-red-500/30 text-text-muted hover:text-red-400 transition-all text-xs flex items-center gap-1"
                  title="Изход от профила"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px] font-medium">Изход</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar — fixed at bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-[#090a0f]/95 backdrop-blur-md py-2 px-1 safe-area-pb">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            const shortLabel = link.label
              .replace('Хранене и макроси', 'Хранене')
              .replace('Прогрес и чек-ин', 'Прогрес')
              .replace('Треньорско студио', 'Треньор');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-all min-w-0 ${
                  isActive ? 'text-blue-400 font-bold' : 'text-text-muted hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-text-muted'}`} />
                <span className="truncate max-w-[52px] text-center">{shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUserUpdated={(u) => setUser(u)}
      />
    </>
  );
}
