import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-display' 
});

export const metadata = {
  title: 'SPORTIX | Autonomous Venue Reservation System',
  description: 'Sistem reservasi lapangan olahraga otonom dan cashless terdepan dengan teknologi ledger real-time.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        {/* Midtrans Snap Script - Dimuat lebih awal agar siap saat checkout */}
        <Script
          src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </head>
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans bg-zinc-950 text-white antialiased min-h-screen flex flex-col selection:bg-brand-emerald/30 selection:text-brand-emerald`}
      >
        {children}
      </body>
    </html>
  );
}