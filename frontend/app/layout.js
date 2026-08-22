import './globals.css';

export const metadata = {
  title: 'Bridgify - Skill Evidence Platform',
  description: 'We don\'t predict placement. We build the evidence that makes it inevitable.',
  keywords: 'skills, placement, education, AI, evidence, assessment',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen" style={{ fontFamily: 'var(--font-display)' }}>
        {children}
      </body>
    </html>
  );
}
