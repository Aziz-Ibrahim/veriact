'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Room, RoomActionItem } from '@/lib/supabase';
import { Share2, Calendar, Copy, CheckCircle, PlayCircle, Clock, ExternalLink } from 'lucide-react';

interface RoomClientProps {
  room: Room;
  initialActionItems: RoomActionItem[];
}

export default function RoomClient({ room, initialActionItems }: RoomClientProps) {
  const { user } = useUser();
  const [actionItems, setActionItems] = useState(initialActionItems);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner = user?.id === room.created_by;

  const handleStatusChange = async (itemId: string, currentStatus: string) => {
    const statusFlow = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending',
    } as const;

    const newStatus = statusFlow[currentStatus as keyof typeof statusFlow];

    // Optimistic update
    setActionItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );

    // Update in database
    try {
      const response = await fetch('/api/rooms/update-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      });

      if (!response.ok) {
        // Revert on error
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, status: currentStatus as "pending" | "in-progress" | "completed" } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert on error
      setActionItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: currentStatus as "pending" | "in-progress" | "completed" } : item
        )
      );
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const expiresAt = new Date(room.expires_at);
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{room.title}</h1>
                <p className="text-xs text-gray-500">Room: {room.room_code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </>
                )}
              </button>
              {user && (
                <a
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-indigo-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  <span>My Dashboard</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Info Banner */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">
                    Shared Room
                  </p>
                  <p className="text-xs text-indigo-700">
                    This room will expire in {daysUntilExpiry} days ({expiresAt.toLocaleDateString()})
                  </p>
                </div>
              </div>
              {!user && (
                <a
                  href="/sign-in"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign in to edit
                </a>
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">Action Items</h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {actionItems.length} items
                </span>
              </div>
            </div>

            {actionItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No action items in this room</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => handleStatusChange(item.id, item.status)}
                            className="mt-1 hover:scale-110 transition"
                            title="Change status"
                            disabled={!user}
                          >
                            {getStatusIcon(item.status)}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium text-gray-900 mb-2 ${
                              item.status === 'completed' ? 'line-through text-gray-500' : ''
                            }`}>
                              {item.task}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center">
                                👤 {item.assignee}
                              </span>
                              {item.deadline && (
                                <span className="flex items-center">
                                  📅 {new Date(item.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
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
                <p className="font-medium text-green-900">Collaborative & Secure</p>
                <p className="text-sm text-green-700">
                  {user 
                    ? 'You can update action item status. Changes are visible to everyone with access.'
                    : 'Sign in to update action item status and track progress.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}