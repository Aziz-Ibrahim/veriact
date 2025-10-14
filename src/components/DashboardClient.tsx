'use client';

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { useExtractActions } from '@/hooks/useExtractActions';
import {
  FileText, Loader2, AlertCircle, Users, Upload, Download, Home, Shield,
  Calendar, Menu, X, Settings } from 'lucide-react';
import ActionItemCard from './ActionItemCard';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import RoomView from './RoomView';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionItem } from '@/types';
import Link from 'next/link';

interface Room {
  id: string;
  room_code: string;
  title: string;
  created_at: string;
  expires_at: string;
}

type ViewMode = 'home' | 'upload' | 'rooms' | 'room-view';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string | null>(null);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

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

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    try {
      const res = await fetch(`/api/rooms/${joinCode}/check-access`);
      const data = await res.json();
      if (data.success) {
        toast.success('Access granted!');
        setViewMode('room-view');
        setSelectedRoomCode(joinCode);
      } else {
        toast.error('Invalid or unauthorized room code');
      }
    } catch {
      toast.error('Failed to verify room access');
    } finally {
      setJoinCode('');
    }
  };

  const handleOpenRoom = (roomCode: string) => {
    setSelectedRoomCode(roomCode);
    setViewMode('room-view');
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

    const isCSV = file.name.endsWith('.csv');

    try {
      const text = await file.text();

      if (isCSV) {
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const importedItems: ActionItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length < 4) continue;

          importedItems.push({
            id: `imported-${Date.now()}-${i}`,
            task: values[0].replace(/^"|"$/g, ''),
            assignee: values[1].replace(/^"|"$/g, ''),
            deadline: values[2] || null,
            status: (values[3] || 'pending') as 'pending' | 'in-progress' | 'completed',
            meetingTitle: values[4]?.replace(/^"|"$/g, '') || 'Imported',
            createdAt: new Date().toISOString(),
          });
        }

        addActionItems(importedItems);
        toast.success(`Imported ${importedItems.length} items from CSV`);
      } else {
        // Parse JSON
        const importedItems = JSON.parse(text) as ActionItem[];

        if (!Array.isArray(importedItems)) {
          throw new Error('Invalid JSON format');
        }

        addActionItems(importedItems);
        toast.success(`Imported ${importedItems.length} items from JSON`);
      }

      setViewMode('home');

      if (event.target) event.target.value = '';
    } catch (error) {
      toast.error('Failed to import. Please use a valid JSON or CSV export from VeriAct.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VeriAct</span>
            </a>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              setViewMode('home');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${viewMode === 'home'
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
            onClick={() => {
              setViewMode('upload');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${viewMode === 'upload'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Process Transcript</span>
          </button>

          <button
            onClick={() => {
              setViewMode('rooms');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${viewMode === 'rooms'
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
                  onClick={() => {
                    setShowCreateRoomModal(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Share with Team</span>
                </button>

                <button
                  onClick={() => {
                    handleExportJSON();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => {
                    handleExportCSV();
                    setSidebarOpen(false);
                  }}
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
          <Link
            href="/profile"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setSidebarOpen(false)}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Account Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-lg font-bold text-gray-900">VeriAct</span>
          </div>
          <Link 
            href="/profile" 
            className="text-gray-700 hover:text-gray-900"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </div>

        <div className="max-w-6xl mx-auto p-4 sm:p-8">
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Action Items</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Track and manage action items from your meetings
                  </p>
                </div>

                {actionItems.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No action items yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6">
                      Process a meeting transcript or import existing items to get started
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={() => setViewMode('upload')}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Process Transcript
                      </button>
                      <label className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer text-center">
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Process Meeting Transcript</h1>
                  <p className="text-sm sm:text-base text-gray-600">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

            {/* Rooms List View */}
            {viewMode === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Rooms</h1>
                  <p className="text-sm sm:text-base text-gray-600">List of rooms that you are a member of</p>
                </div>

                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setShowJoinRoomModal(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                  >
                    Join Room
                  </button>
                </div>


                {myRooms.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No shared rooms yet.</p>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {myRooms.map((room) => (
                      <div
                        key={room.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition cursor-pointer"
                        onClick={() => handleOpenRoom(room.room_code)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{room.title}</h3>
                            <p className="text-sm text-indigo-600">Code: {room.room_code}</p>
                          </div>
                          {mounted && (
                            <div className="flex flex-col text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                <span className="leading-tight">Created {new Date(room.created_at).toLocaleDateString()}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-orange-600" aria-hidden>⏰</span>
                                <span className="text-orange-600 leading-tight">Expires {new Date(room.expires_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Room Detail View */}
            {viewMode === 'room-view' && selectedRoomCode && (
              <motion.div
                key="room-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <RoomView
                  roomCode={selectedRoomCode}
                  onBack={() => setViewMode('rooms')}
                />
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

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={showJoinRoomModal}
        onClose={() => setShowJoinRoomModal(false)}
        onJoin={(code) => {
          setSelectedRoomCode(code);
          setViewMode('room-view');
        }}
      />

    </div>
  );
}