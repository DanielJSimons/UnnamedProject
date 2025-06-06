"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  // If not logged in, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // This will briefly show before redirect
  return null;
}
