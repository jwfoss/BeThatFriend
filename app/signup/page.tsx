'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'

const passwordRequirements = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /[0-9]/.test(pw) },
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const passwordValidation = useMemo(() => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.test(password)
    }))
  }, [password])

  const allRequirementsMet = passwordValidation.every(req => req.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit = isValidEmail && allRequirementsMet && passwordsMatch

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!canSubmit) return

    setLoading(true)

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${appUrl}/auth/confirm`,
        },
      })

      // Debug logging for email delivery issues
      console.log('Signup response:', { data, error })
      if (error) {
        console.error('Signup error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
        })
        throw error
      }

      // Redirect to verify email page - user must confirm before accessing app
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      console.error('Signup catch error:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            Be That Friend
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordValidation.map((req, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    {req.met ? (
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      </svg>
                    )}
                    <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Input
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Passwords match
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={!canSubmit}
          >
            Sign Up
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-xs text-center text-gray-500 mt-4">
            By signing up, you agree to our <a href="/privacy" className="underline hover:text-indigo-600">Privacy Policy</a> and <a href="/terms" className="underline hover:text-indigo-600">Terms of Service</a>.
          </p>
        </form>
      </div>
    </main>
  )
}
