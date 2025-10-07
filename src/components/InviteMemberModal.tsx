'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export default function InviteMemberModal({ isOpen, onClose, roomCode }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'viewer' | 'editor'>('editor');
  const [inviting, setInviting] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setInviting(true);
    try {
      const res = await fetch(`/api/rooms/${roomCode}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), accessLevel }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('Member invited successfully!');
        setEmail('');
        onClose();
      } else {
        toast.error(data.error || 'Failed to invite');
      }
    } catch (error) {
      toast.error('Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-700 font-semibold">Invite Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Level
            </label>
            <div className="space-y-2">
              <label className="flex text-gray-700 items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={accessLevel === 'editor'}
                  onChange={() => setAccessLevel('editor')}
                  className="text-indigo-600"
                />
                <div>
                  <p className="font-medium text-sm">Editor</p>
                  <p className="text-xs text-gray-500">Can update action item status</p>
                </div>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={accessLevel === 'viewer'}
                  onChange={() => setAccessLevel('viewer')}
                  className="text-indigo-600"
                />
                <div>
                  <p className="font-medium text-gray-700 text-sm">Viewer</p>
                  <p className="text-xs text-gray-500">Can only view action items</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 flex items-center space-x-2"
            >
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inviting...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}