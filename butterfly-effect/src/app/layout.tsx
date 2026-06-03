import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Butterfly Effect - Counterfactual History Engine',
  description: 'Explore alternate timelines. What if history took a different turn?',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
