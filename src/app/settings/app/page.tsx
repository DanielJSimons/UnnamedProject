'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const AppSettings = () => {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Application Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Application settings coming soon...</p>
      </div>
    </div>
  );
};

export default AppSettings; 