'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Login() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/calendar',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gradient-background">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="font-serif text-4xl italic mb-2 text-black hover:text-sage-200 transition-colors">
            lock in with fi
          </h1>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-serif mb-6 text-center">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg text-center text-sm">
            {error === 'OAuthSignin' 
              ? 'An error occurred during sign in. Please try again.'
              : 'An error occurred. Please try again.'}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          Continue with Google
        </button>
      </div>
    </main>
  );
} 