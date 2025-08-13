
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (userData?.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
      } else {
        router.replace('/');
      }
    }
  }, [user, userData, loading, router]);

  return <div>Loading...</div>;
}
