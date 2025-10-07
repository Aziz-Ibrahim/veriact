'use client';

import { useState, useEffect } from 'react';
import { Room, RoomActionItem } from '@/lib/supabase';
import { Share2, Calendar, Copy, CheckCircle, PlayCircle, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DashboardRoomClientProps {
  room: Room;
  initialActionItems: RoomActionItem[];
}

export default function DashboardRoomClient({ room, initialActionItems }: DashboardRoomClientProps) {
  const router = useRouter();
  const [actionItems, setActionItems] = useState(initialActionItems);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStatusChange = async (itemId: string, currentStatus: string) => {
    const statusFlow: Record<string, 'pending' | 'in-progress' | 'completed'> = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending',
    };

    const newStatus = statusFlow[currentStatus];

    setActionItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );

    try {
      const response = await fetch('/api/rooms/update-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      });

      if (!response.ok) {
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, status: currentStatus as 'pending' | 'in-progress' | 'completed' } : item
          )
        );
        toast.error('Failed to update status');
      } else {
        toast.success('Status updated');
      }
    } catch (error) {
      setActionItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: currentStatus as 'pending' | 'in-progress' | 'completed' } : item
        )
      );
      toast.error('Failed to update status');
    }
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room code copied');
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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{room.title}</h1>
            <p className="text-sm text-gray-500">Room Code: {room.room_code}</p>
          </div>
          <button
            onClick={handleCopyRoomCode}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Copy Room Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-indigo-900">Shared Room</p>
            <p className="text-xs text-indigo-700">
              Expires in {daysUntilExpiry} days ({expiresAt.toLocaleDateString()})
            </p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Action Items ({actionItems.length})</h2>
        
        {actionItems.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No action items in this room</p>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleStatusChange(item.id, item.status)}
                        className="mt-1 hover:scale-110 transition flex-shrink-0"
                      >
                        {getStatusIcon(item.status)}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-gray-900 mb-2 break-words ${
                          item.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}>
                          {item.task}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span>👤 {item.assignee}</span>
                          {item.deadline && (
                            <span>📅 {new Date(item.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}