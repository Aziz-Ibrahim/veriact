'use client';

import { useState, useEffect } from 'react';
import { Share2, Calendar, CheckCircle, PlayCircle, Clock, ArrowLeft, Loader2, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import InviteMemberModal from './InviteMemberModal';

interface RoomViewProps {
  roomCode: string;
  onBack: () => void;
}

export default function RoomView({ roomCode, onBack }: RoomViewProps) {
  const [room, setRoom] = useState<any>(null);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadRoom();
  }, [roomCode]);

  const loadRoom = async () => {
    setLoading(true);
    try {
      // Check access first
      const accessRes = await fetch(`/api/rooms/${roomCode}/check-access`);
      const accessData = await accessRes.json();
      
      if (!accessData.hasAccess) {
        toast.error(accessData.error || 'Access denied');
        onBack();
        return;
      }

      setIsOwner(accessData.isOwner || false);

      const res = await fetch(`/api/rooms/${roomCode}`);
      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
        setActionItems(data.actionItems);
        
        // Load members if owner
        if (accessData.isOwner) {
          loadMembers();
        }
      } else {
        toast.error('Room not found');
        onBack();
      }
    } catch (error) {
      toast.error('Failed to load room');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}/members`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

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
            item.id === itemId ? { ...item, status: currentStatus as any } : item
          )
        );
        toast.error('Failed to update');
      } else {
        toast.success('Updated');
      }
    } catch (error) {
      setActionItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: currentStatus as any } : item
        )
      );
      toast.error('Failed to update');
    }
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room code copied');
  };

  const handleInviteClose = () => {
    setShowInviteModal(false);
    loadMembers(); // Refresh members list after invite
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

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!room) return null;

  const expiresAt = new Date(room.expires_at);
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to My Rooms</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{room.title}</h1>
            <p className="text-sm text-gray-500">Room: {room.room_code}</p>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>{members.length}</span>
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
                </button>
              </>
            )}
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
      </div>

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

      {/* Members List */}
      {isOwner && showMembers && members.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Room Members ({members.length})</h2>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{member.user_email}</p>
                  <p className="text-xs text-gray-500">
                    Invited {new Date(member.invited_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                  {member.access_level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Action Items ({actionItems.length})</h2>
        
        {actionItems.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No action items</p>
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

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={handleInviteClose}
        roomCode={roomCode}
      />
    </div>
  );
}