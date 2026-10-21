import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Journal — Ideas worth sharing. Stories worth reading.',
  description:
    'An independent editorial publishing platform and CMS atelier for deliberate thinking, systems craftsmanship, and long-form writing.',
  openGraph: {
    title: 'The Journal — Ideas worth sharing. Stories worth reading.',
    description:
      'An independent editorial publishing platform and CMS atelier for deliberate thinking, systems craftsmanship, and long-form writing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Journal — Ideas worth sharing. Stories worth reading.',
    description:
      'An independent editorial publishing platform and CMS atelier for deliberate thinking, systems craftsmanship, and long-form writing.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-on-surface antialiased font-editorial-sans selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
