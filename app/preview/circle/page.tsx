"use client"

import React from 'react'
import Input from '@/components/ui/Input'

export default function CirclePreview() {
  const sampleInvites = [
    { name: '', email: '', manual: false, sent: false },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">Add Friends To Circle</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm text-center">Invite 3 or more to see your meaningful dates.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</span>
              </div>
              <div className="col-span-5">
                <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</span>
              </div>
              <div className="col-span-2"></div>
            </div>

            {sampleInvites.map((inv, idx) => (
              <div key={idx} className="flex items-center gap-4 py-2">
                <div className="w-48">
                  {!inv.manual && !inv.name && !inv.sent ? (
                    <div className="flex gap-2">
                      <button className="flex-1 h-10 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 text-sm whitespace-nowrap px-3">Add Manually</button>
                    </div>
                  ) : !inv.manual ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium truncate">{inv.name}</span>
                      </div>
                      {inv.sent && inv.email && (
                        <div className="text-sm text-gray-500 mt-1 truncate">{inv.email}</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input placeholder="Name" value={inv.name} />
                      <Input placeholder="Email" value={inv.email} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {inv.manual || (inv.name && !inv.sent) ? (
                    <Input placeholder="Email" value={inv.email} />
                  ) : (
                    <div />
                  )}
                </div>

                <div className="w-32 flex flex-col items-end">
                  <button className={`w-full h-10 rounded-xl font-semibold ${inv.sent ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>{inv.sent ? 'Added' : 'Add'}</button>
                </div>
              </div>
            ))}


          </div>
        </div>

        <button className="w-full py-3 rounded-xl bg-indigo-700 text-white font-bold text-lg mt-8">Finish</button>
        <button className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2">Back to dates</button>
      </div>
    </main>
  )
}
