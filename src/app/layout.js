import './globals.css';

export const metadata = {
  title: 'Sportix - Reservasi Lapangan Olahraga',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-zinc-950 text-zinc-100">
      <body className="antialiased">{children}</body>
    </html>
  );
}
