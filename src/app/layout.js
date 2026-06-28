import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  title: 'Sportix - Reservasi Lapangan Olahraga',
  description: 'Sistem reservasi lapangan olahraga otonom dan cashless.',
};

// EXPORT VIEWPORT TERPISAH
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${space.variable} ${mono.variable} scroll-smooth`}>
      <body className="antialiased bg-background text-foreground font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}