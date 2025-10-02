'use client';

import { UserButton } from '@clerk/nextjs';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function DashboardClient() {
  const { actionItems, isProcessing } = useStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    
    // TODO: Process the file locally
    console.log('Processing file:', selectedFile.name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">VeriAct</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Action Item Dashboard
            </h1>
            <p className="text-gray-600">
              Process your meeting transcripts to extract action items. All processing happens in your browser.
            </p>
          </div>

          {/* File Processing Card */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Process Meeting Transcript</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              <div className="mb-4">
                <label
                  htmlFor="file-input"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Select Transcript File
                </label>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileSelect}
                />
              </div>

              {selectedFile && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500">
                Supports TXT, DOCX, and PDF files
              </p>
            </div>

            {selectedFile && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Extract Action Items'}
                </button>
              </div>
            )}
          </div>

          {/* Action Items List */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Action Items</h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {actionItems.length} items
              </span>
            </div>

            {actionItems.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 mb-2">No action items yet</p>
                <p className="text-sm text-gray-400">
                  Process a meeting transcript to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{item.task}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>👤 {item.assignee}</span>
                          {item.deadline && (
                            <span>📅 {new Date(item.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-green-900">Privacy Protected</p>
                <p className="text-sm text-green-700">
                  Your files are processed locally in your browser. Nothing is sent to our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}