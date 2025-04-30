// app/signup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../services/supabaseClient'; // Adjust path if necessary
import { AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from "@/components/ui/button"; // Assuming ShadCN button
import { Input } from "@/components/ui/input";   // Assuming ShadCN input
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // clear error banner after 3s
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // clear success banner after 3s
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Registration successful! Check your email to confirm.');
      // optionally redirect after success:
      // setTimeout(() => router.push('/signin'), 3500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Error banner */}
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
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="flex-1">{error}</span>
      </div>

      {/* Success banner */}
      <div
        className={`
          fixed top-6 left-1/2 transform -translate-x-1/2
          w-1/4 text-sm
          bg-white text-gray-900
          flex items-center space-x-3
          px-6 py-4
          rounded-lg
          shadow-xl
          pointer-events-none
          transition-all duration-300
          ${success ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
      >
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="flex-1">{success}</span>
      </div>

      <div className="w-1/4 p-4 max-w-md text-center">
        <h1 className="text-xl font-bold text-white mb-2">Sign Up</h1>
        <p className="text-sm text-neutral-400 mb-11">
          Create an account with your email and password
        </p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-left text-sm font-medium text-neutral-300 mb-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="rounded-sm bg-zinc-800 text-white border-none placeholder:text-neutral-500 h-10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-left text-sm font-medium text-neutral-300 mb-1"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-sm bg-zinc-800 text-white border-none placeholder:text-neutral-500 h-10"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-neutral-200 rounded-md py-2 transition"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-8 text-neutral-400 text-sm">
          Already have an account?{' '}
          <Link href="/signin" className="text-white hover:underline">
            Sign in instead.
          </Link>
        </p>
      </div>
    </div>
  );
}
