'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user has completed onboarding
      const { data: userData } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .single()

      // Check for pending invite code from join page
      const pendingInviteCode = sessionStorage.getItem('pendingInviteCode')

      if (!userData) {
        // New user - redirect to onboarding
        router.push('/onboard')
      } else if (pendingInviteCode) {
        // User came from invite link - redirect back to join page
        sessionStorage.removeItem('pendingInviteCode')
        router.push(`/join/${pendingInviteCode}`)
      } else {
        // Existing user - redirect to circle
        router.push('/circle')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
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
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={!email || !password}
          >
            Sign In
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>

          <p className="text-xs text-center text-gray-500 mt-4">
            By continuing, you agree to our <a href="/privacy" className="underline hover:text-indigo-600">Privacy Policy</a> and <a href="/terms" className="underline hover:text-indigo-600">Terms of Service</a>.
          </p>
        </form>
      </div>
    </main>
  )
}
