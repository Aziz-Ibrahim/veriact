// src/components/DashboardClient.tsx
'use client';

import { UserButton } from '@clerk/nextjs';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { useExtractActions } from '@/hooks/useExtractActions';
import { FileText, Loader2, AlertCircle, Users, Upload, Download, Home, Shield, Calendar } from 'lucide-react';
import ActionItemCard from './ActionItemCard';
import CreateRoomModal from './CreateRoomModal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionItem } from '@/types';

interface Room {
  id: string;
  room_code: string;
  title: string;
  created_at: string;
  expires_at: string;
}

type ViewMode = 'home' | 'upload' | 'rooms';

export default function DashboardClient() {
  const { actionItems, clearActionItems, addActionItems } = useStore();
  const { extractActions, isProcessing, error } = useExtractActions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [lastMeetingTitle, setLastMeetingTitle] = useState('');
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (viewMode === 'rooms') {
      loadMyRooms();
    }
  }, [viewMode]);

  const loadMyRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await fetch('/api/rooms/my-rooms');
      const data = await response.json();
      if (data.success) {
        setMyRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!meetingTitle) {
        setMeetingTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    
    const result = await extractActions(selectedFile, meetingTitle);
    
    if (result.success) {
      toast.success(`Extracted ${result.count} action items!`);
      setLastMeetingTitle(meetingTitle || selectedFile.name.replace(/\.[^/.]+$/, ''));
      setSelectedFile(null);
      setMeetingTitle('');
      setViewMode('home');
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleRoomCreated = () => {
    setTimeout(() => {
      clearActionItems();
      toast.success('Room created and shared!');
      loadMyRooms();
      setViewMode('rooms');
    }, 300);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(actionItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veriact-actions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
      clearActionItems();
      toast.success('Exported and cleared!');
    }, 300);
  };

  const handleExportCSV = () => {
    const headers = ['Task', 'Assignee', 'Deadline', 'Status', 'Meeting'];
    const rows = actionItems.map(item => [
      `"${item.task.replace(/"/g, '""')}"`,
      `"${item.assignee}"`,
      item.deadline || '',
      item.status,
      `"${item.meetingTitle || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veriact-actions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
      clearActionItems();
      toast.success('Exported and cleared!');
    }, 300);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedItems = JSON.parse(text) as ActionItem[];
      
      if (!Array.isArray(importedItems)) {
        throw new Error('Invalid JSON format');
      }

      addActionItems(importedItems);
      toast.success(`Imported ${importedItems.length} items!`);
      setViewMode('home');
      
      const fileInput = event.target;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Failed to import. Please use a valid JSON export.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">VeriAct</span>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 m-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-900 mb-1">Privacy First</p>
              <p className="text-xs text-green-700 leading-relaxed">
                Processing happens locally. Data stored only in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setViewMode('home')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              viewMode === 'home'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Action Items</span>
            {mounted && actionItems.length > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs">
                {actionItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode('upload')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              viewMode === 'upload'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Process Transcript</span>
          </button>

          <button
            onClick={() => setViewMode('rooms')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              viewMode === 'rooms'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">My Rooms</span>
            {mounted && myRooms.length > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs">
                {myRooms.length}
              </span>
            )}
          </button>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </p>
            
            {actionItems.length > 0 && (
              <>
                <button
                  onClick={() => setShowCreateRoomModal(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Share with Team</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </>
            )}

            <label className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Home View - Action Items */}
            {viewMode === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Action Items</h1>
                  <p className="text-gray-600">
                    Track and manage action items from your meetings
                  </p>
                </div>

                {actionItems.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No action items yet</h3>
                    <p className="text-gray-600 mb-6">
                      Process a meeting transcript or import existing items to get started
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => setViewMode('upload')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Process Transcript
                      </button>
                      <label className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                        Import JSON
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <motion.div layout className="space-y-4">
                    <AnimatePresence>
                      {actionItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ActionItemCard item={item} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Upload View */}
            {viewMode === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Process Meeting Transcript</h1>
                  <p className="text-gray-600">
                    Upload a transcript file to extract action items automatically
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="e.g., Weekly Team Standup - Jan 15"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-400 transition">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    
                    <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                      Select Transcript File
                      <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        accept=".txt,.docx"
                        onChange={handleFileSelect}
                        disabled={isProcessing}
                      />
                    </label>

                    {selectedFile && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          Selected: <span className="font-medium">{selectedFile.name}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mt-4">
                      Supports TXT and DOCX files
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
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
              </motion.div>
            )}

            {/* Rooms View */}
            {viewMode === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Shared Rooms</h1>
                  <p className="text-gray-600">
                    Collaborate with your team on action items
                  </p>
                </div>

                {loadingRooms ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-500">Loading rooms...</p>
                  </div>
                ) : myRooms.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No shared rooms yet</h3>
                    <p className="text-gray-600 mb-6">
                      Create a room to collaborate with your team on action items
                    </p>
                    <button
                      onClick={() => setViewMode('home')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      View Action Items
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-300 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                🔗 {room.room_code}
                              </span>
                              {mounted && (
                                <>
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Created {new Date(room.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center text-orange-600">
                                    ⏰ Expires {new Date(room.expires_at).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <a
                            href={`/room/${room.room_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex-shrink-0"
                          >
                            Open Room
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        actionItems={actionItems}
        meetingTitle={lastMeetingTitle}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}