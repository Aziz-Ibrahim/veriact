'use client';

import { UserButton } from '@clerk/nextjs';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { useExtractActions } from '@/hooks/useExtractActions';
import { FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import ActionItemCard from './ActionItemCard';
import ExportMenu from './ExportMenu';

export default function DashboardClient() {
  const { actionItems } = useStore();
  const { extractActions, isProcessing, error } = useExtractActions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSuccessMessage(null);
      // Auto-populate meeting title from filename
      if (!meetingTitle) {
        setMeetingTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    
    const result = await extractActions(selectedFile, meetingTitle);
    
    if (result.success) {
      setSuccessMessage(`Successfully extracted ${result.count} action item${result.count !== 1 ? 's' : ''}!`);
      setSelectedFile(null);
      setMeetingTitle('');
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
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

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* File Processing Card */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Process Meeting Transcript</h2>
            
            {/* Meeting Title Input */}
            <div className="mb-6">
              <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title (Optional)
              </label>
              <input
                id="meeting-title"
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g., Weekly Team Standup - Jan 15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isProcessing}
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              
              <div className="mb-4">
                <label
                  htmlFor="file-input"
                  className={`cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Select Transcript File
                </label>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".txt,.docx"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                />
              </div>

              {selectedFile && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500">
                Supports TXT and DOCX files (PDF coming soon)
              </p>
            </div>

            {selectedFile && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Extract Action Items</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action Items List */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">Your Action Items</h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {actionItems.length} items
                </span>
              </div>
              <ExportMenu actionItems={actionItems} />
            </div>

            {actionItems.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No action items yet</p>
                <p className="text-sm text-gray-400">
                  Process a meeting transcript to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {actionItems.map((item) => (
                  <ActionItemCard key={item.id} item={item} />
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
                  Your files are processed locally in your browser. Results are saved to your browser's local storage only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}