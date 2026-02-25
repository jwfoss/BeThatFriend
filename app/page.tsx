import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            Be That Friend
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Never miss a meaningful date
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <p className="text-left text-gray-700 dark:text-gray-200">
                Share and request important dates and milestones
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔔</span>
              <p className="text-left text-gray-700 dark:text-gray-200">
                Get reminders when dates arrive
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤝</span>
              <p className="text-left text-gray-700 dark:text-gray-200">
                Drop a text or give a call ... be THAT friend
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg shadow-lg"
        >
          Get Started
        </Link>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Free to use. Your data stays private.
        </p>
      </div>
    </main>
  )
}
