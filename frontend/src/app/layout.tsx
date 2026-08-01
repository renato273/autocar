// src/app/layout.tsx
import './globals.css';
import NavBar from '../components/NavBar';
import { Toaster } from '../components/Toaster';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autocar',
  description: 'Vehicle management app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <NavBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
