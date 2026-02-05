"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

// Loading fallback component
function LoginFormSkeleton() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} className="bg-gradient-to-b from-gray-950 to-gray-900">
      <div style={{ width: '100%', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ height: '2.75rem', width: '2.75rem', borderRadius: '0.75rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }} className="bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>Q</span>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', letterSpacing: '-0.025em' }}>
              QuestionForge
            </span>
          </div>
          <p style={{ marginTop: '0.75rem', color: '#9CA3AF' }}>Loading...</p>
        </div>
        <div style={{ borderRadius: '1rem', border: '1px solid rgba(55, 65, 81, 0.5)', background: 'rgba(17, 24, 39, 0.6)', padding: '2rem' }}>
          <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ height: '2.75rem', backgroundColor: '#1F2937', borderRadius: '0.5rem' }} />
            <div style={{ height: '2.75rem', backgroundColor: '#1F2937', borderRadius: '0.5rem' }} />
            <div style={{ height: '2.75rem', backgroundColor: '#1E3A5F', borderRadius: '0.75rem' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Login form component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} className="bg-gradient-to-b from-gray-950 to-gray-900">
      <div style={{ width: '100%', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ height: '3rem', width: '3rem', borderRadius: '0.75rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }} className="bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Q</span>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', letterSpacing: '-0.025em' }}>
              QuestionForge
            </span>
          </Link>
          <p style={{ marginTop: '0.75rem', color: '#9CA3AF', fontSize: '1rem' }}>
            Sign in to your account
          </p>
        </div>

        {/* Success Message */}
        {registered && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(20, 83, 45, 0.2)', border: '1px solid #166534', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p style={{ color: '#4ADE80', fontSize: '0.875rem' }}>
              Account created successfully! Please sign in.
            </p>
          </div>
        )}

        {/* Login Form - Modern card styling */}
        <div style={{
          borderRadius: '1rem',
          border: '1px solid rgba(55, 65, 81, 0.5)',
          background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.6) 0%, rgba(17, 24, 39, 0.8) 100%)',
          padding: '2.5rem',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Error Message */}
            {error && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(127, 29, 29, 0.2)',
                border: '1px solid #991B1B',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }} role="alert">
                <AlertCircle style={{ height: '1.25rem', width: '1.25rem', color: '#F87171', flexShrink: 0 }} />
                <p style={{ color: '#F87171', fontSize: '0.9375rem' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#E5E7EB',
                  marginBottom: '0.75rem'
                }}
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                icon={<Mail style={{ height: '1.25rem', width: '1.25rem' }} />}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#E5E7EB',
                  marginBottom: '0.75rem'
                }}
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '0.5rem' }}>
              <Button
                type="submit"
                style={{ width: '100%' }}
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          {/* Register Link */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.75rem',
            borderTop: '1px solid rgba(55, 65, 81, 0.5)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.9375rem', color: '#9CA3AF' }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{ fontWeight: '600', color: '#60A5FA' }}
                className="hover:text-blue-400 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#9CA3AF',
              fontSize: '0.9375rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            className="hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft style={{ height: '1.125rem', width: '1.125rem' }} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
