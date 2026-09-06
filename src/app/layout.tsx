import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'FitLog | Personal Coach Athlete Portal',
  description: 'FitLog – Твоят персонален AI треньор и портал за високи спортни постижения, хранене и тренировки.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-base text-text-primary antialiased min-h-screen flex flex-col selection:bg-white/20 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">
          {children}
        </main>
      </body>
    </html>
  );
}
