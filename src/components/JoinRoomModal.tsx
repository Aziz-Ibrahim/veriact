'use client';

import { useState } from 'react';
import { X, Loader2, DoorOpen } from 'lucide-react';
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
    const code = roomCode.trim();
    if (!code) {
      toast.error('Please enter a room code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${code}/check-access`);
      const data = await res.json();
      
      // Check if user has access based on the check-access endpoint response
      if (data.hasAccess) {
        toast.success('Joined successfully!');
        onJoin(code);
        setRoomCode(''); // Clear input
        onClose();
      } else {
        // Show specific error message from API
        toast.error(data.error || 'Invalid or unauthorized room code');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to verify room');
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
    setRoomCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl text-gray-900 font-semibold">Join a Room</h2>
            <p className="text-xs text-gray-500">Access shared action items</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Enter the room code that was shared with you to access the action items.
        </p>

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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: ROOM-XXXXXXX
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={loading || !roomCode.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
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