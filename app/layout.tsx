import type { Metadata } from 'next';
// Remove the globals.css import for now
// import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube Downloader',
  description: 'Download YouTube videos easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}