'use client';

import { useState } from 'react';
import { X, Loader2, DoorOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
}

export default function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async () => {
    const code = roomCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a room code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await res.json();
      
      if (res.ok && data.hasAccess) {
        toast.success(
          data.isOwner 
            ? 'Welcome back to your room!' 
            : `Joined as ${data.accessLevel}!`
        );
        onJoin(code);
        setRoomCode('');
        onClose();
      } else {
        toast.error(data.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Network error - please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleJoin();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRoomCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl text-gray-900 font-semibold">Join a Room</h2>
            <p className="text-xs text-gray-500">Enter the code shared with you</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Free users can join too!</p>
              <p className="text-xs text-blue-700">
                You can join and collaborate in rooms created by Pro or Enterprise users, 
                even if you're on the free plan.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="ROOM-XXXXXXX"
            className="w-full px-4 py-2.5 text-indigo-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            autoFocus
            disabled={loading}
            maxLength={15}
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: ROOM-XXXXXXX (case insensitive)
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={loading || !roomCode.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Joining...
              </>
            ) : (
              <>
                <DoorOpen className="w-4 h-4 mr-2" />
                Join Room
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}