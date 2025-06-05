import React from 'react';
import { Layout } from '@/components/Layout/Layout';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/global.scss';

export const metadata = {
  title: 'Unnamed Project - Video News Analysis & Sentiment Tracking',
  description: 'Analyze news video transcripts for entity mentions and sentiment. Track how key figures, organizations, and events are portrayed across thousands of news sources.',
  keywords: 'video analysis, news analysis, sentiment analysis, entity recognition, media monitoring',
};

// Client-side wrapper component
const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
