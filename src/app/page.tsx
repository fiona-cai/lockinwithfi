'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gradient-background">
      <div className="text-center">
        <h1 className="font-serif text-6xl md:text-7xl italic mb-2 text-black">
          lock in with fi
        </h1>
        <p className="font-sans text-sage-300 text-lg mb-8">
          AI Time Tracking App
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login"
            className="px-8 py-3 rounded-full bg-white text-sage-200 font-sans hover:bg-sage-200 hover:text-white transition-colors shadow-sm"
          >
            Log In
          </Link>
          <Link 
            href="/signup"
            className="px-8 py-3 rounded-full bg-sage-200 text-white font-sans hover:bg-sage-300 transition-colors shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
