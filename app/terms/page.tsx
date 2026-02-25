import Link from 'next/link';

export default function TermsOfService() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Effective Date: February 2, 2026</p>
        <ol className="list-decimal pl-6 mb-4 text-gray-800 dark:text-gray-200">
          <li className="mb-2">
            <strong>Program Description</strong><br />
            Be That Friend sends email reminders for meaningful dates (birthdays, anniversaries, and other important occasions) of individuals in your &quot;circle&quot;.
          </li>
          <li className="mb-2">
            <strong>Email Frequency</strong><br />
            Email frequency varies based on the number of friends and dates in your circle. You may receive a monthly digest summarizing upcoming dates.
          </li>
          <li className="mb-2">
            <strong>Opt-Out</strong><br />
            You can unsubscribe from email reminders at any time by clicking the unsubscribe link in any email or by adjusting your preferences in your account settings.
          </li>
          <li className="mb-2">
            <strong>Account Security</strong><br />
            You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.
          </li>
          <li className="mb-2">
            <strong>User Content</strong><br />
            You retain ownership of the dates and information you add to the service. By using Be That Friend, you grant us permission to store and process this data to provide the reminder service.
          </li>
          <li className="mb-2">
            <strong>Service Availability</strong><br />
            We strive to maintain reliable service but do not guarantee uninterrupted access. We reserve the right to modify or discontinue the service with reasonable notice.
          </li>
        </ol>
        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">View Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}
