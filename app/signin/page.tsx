'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../services/supabaseClient'; // Adjust path if necessary

import { Button } from "@/components/ui/button"; // Assuming ShadCN button
import { Input } from "@/components/ui/input";   // Assuming ShadCN input
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Successful sign-in
      // Redirect to the home page or dashboard
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"> {/* Added bg-black for explicit black background if needed */}

    {/* Notification banner */}
      <div
        className={`
          fixed top-6 left-1/2 transform -translate-x-1/2
          w-1/5 text-sm
          bg-white text-gray-900
          flex items-center space-x-3
          px-6 py-4
          rounded-lg
          shadow-xl
          pointer-events-none
          transition-all duration-300
          ${error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
      >
        <AlertCircle className="w-5 h-5" />
        <span className="flex-1">{error}</span>
      </div>

      <div className="w-1/4 p-4 max-w-md text-center">
        <h1 className="text-xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-sm text-neutral-400 mb-11">Use your email and password to sign in</p> {/* Adjusted text */}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-left text-sm font-medium text-neutral-300 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="rounded-sm bg-zinc-800 text-white border-none placeholder:text-neutral-500 h-10" // Adjusted focus color to fit dark theme better
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-left text-sm font-medium text-neutral-300 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-sm bg-zinc-800 text-white border-none placeholder:text-neutral-500 h-10"// Adjusted focus color
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-neutral-200 rounded-md py-2 transition"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-8 text-neutral-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-white hover:underline"> {/* Link to signup page */}
            Sign up for free. {/* Adjusted text */}
          </Link>
        </p>
      </div>
    </div>
  );
}