import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Privacy Policy for Be That Friend</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Effective Date: February 2, 2026</p>

        <h2 className="text-lg font-semibold mt-6 mb-2">Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4 text-gray-800 dark:text-gray-200">
          <li><strong>Email Address:</strong> We collect your email address to create your account and send you reminders about meaningful dates in your circle.</li>
          <li><strong>Name:</strong> We collect your name to personalize your experience and display it to your connections.</li>
          <li><strong>Meaningful Dates:</strong> We store the dates and occasions you choose to share (birthdays, anniversaries, etc.) to provide the reminder service.</li>
          <li><strong>Connection Information:</strong> We store information about who is in your circle to facilitate date sharing between friends.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4 text-gray-800 dark:text-gray-200">
          <li>To provide the core reminder service and notify you of upcoming meaningful dates.</li>
          <li>To send account-related emails (verification, password reset).</li>
          <li>To send optional monthly digest emails summarizing upcoming dates.</li>
          <li>To facilitate connections between you and your friends.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">Data Sharing</h2>
        <ul className="list-disc pl-6 mb-4 text-gray-800 dark:text-gray-200">
          <li><strong>With Your Circle:</strong> Your meaningful dates are shared only with confirmed connections in your circle.</li>
          <li><strong>No Third-Party Marketing:</strong> Your personal information will not be shared with third parties for marketing or promotional purposes.</li>
          <li><strong>Service Providers:</strong> We use trusted third-party services (email delivery, hosting) to operate the service. These providers only access data necessary to perform their functions.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">Data Security</h2>
        <p className="mb-4 text-gray-800 dark:text-gray-200">
          We implement industry-standard security measures to protect your data, including encrypted connections and secure password storage.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">Your Rights</h2>
        <ul className="list-disc pl-6 mb-4 text-gray-800 dark:text-gray-200">
          <li>Access and update your personal information through your account settings.</li>
          <li>Delete your account and associated data by contacting us.</li>
          <li>Unsubscribe from non-essential emails at any time.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">Contact Us</h2>
        <p className="mb-4 text-gray-800 dark:text-gray-200">
          If you have questions about this Privacy Policy, please contact us at privacy@bethatfriend.app.
        </p>

        <div className="mt-8 text-center">
          <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">View Terms of Service</Link>
        </div>
      </div>
    </main>
  );
}
