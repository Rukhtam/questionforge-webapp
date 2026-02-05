"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, User, ArrowLeft, AlertCircle, Check, X } from "lucide-react";

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }} className="bg-gradient-to-b from-gray-950 to-gray-900">
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
            Create your free account
          </p>
        </div>

        {/* Registration Form - Modern card styling */}
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

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#E5E7EB',
                  marginBottom: '0.75rem'
                }}
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="John Doe"
                icon={<User style={{ height: '1.25rem', width: '1.25rem' }} />}
              />
            </div>

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
                Email Address <span style={{ color: '#F87171' }}>*</span>
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
                Password <span style={{ color: '#F87171' }}>*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
              />
              {/* Password Strength Indicator */}
              {password && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: '0.375rem', backgroundColor: '#1F2937', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(passwordStrength.score / 6) * 100}%`,
                          backgroundColor: passwordStrength.label === "Weak" ? '#EF4444' : passwordStrength.label === "Medium" ? '#F59E0B' : '#22C55E',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: passwordStrength.label === "Weak" ? '#F87171' : passwordStrength.label === "Medium" ? '#FBBF24' : '#4ADE80'
                    }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#E5E7EB',
                  marginBottom: '0.75rem'
                }}
              >
                Confirm Password <span style={{ color: '#F87171' }}>*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                error={passwordsDontMatch ? "Passwords do not match" : undefined}
              />
              {passwordsMatch && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#4ADE80', fontSize: '0.875rem' }}>
                  <Check style={{ height: '1rem', width: '1rem' }} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '0.5rem' }}>
              <Button
                type="submit"
                style={{ width: '100%' }}
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.75rem',
            borderTop: '1px solid rgba(55, 65, 81, 0.5)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.9375rem', color: '#9CA3AF' }}>
              Already have an account?{" "}
              <Link
                href="/login"
                style={{ fontWeight: '600', color: '#60A5FA' }}
                className="hover:text-blue-400 transition-colors"
              >
                Sign in
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
