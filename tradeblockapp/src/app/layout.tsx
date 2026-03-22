import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'tradeBlock — NBA Performance Charts',
  description: 'Stock-market style candlestick charts for NBA team performance. Visualize win streaks, momentum, and season trends.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden', background: '#0d0f0e' }}>
        {children}
      </body>
    </html>
  );
}