'use client';

import { useState } from 'react';
import { X, Users, Shield, Calendar, Link as LinkIcon, Loader2 } from 'lucide-react';
import { ActionItem } from '@/types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItems: ActionItem[];
  meetingTitle: string;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  actionItems,
  meetingTitle,
}: CreateRoomModalProps) {
  const [title, setTitle] = useState(meetingTitle || '');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomCreated, setRoomCreated] = useState<{
    roomCode: string;
    link: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setError(null);

    if (!title.trim()) {
      setError('Please enter a room title');
      return;
    }

    if (!agreedToPrivacy) {
      setError('You must agree to the privacy terms');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          actionItems,
          agreedToPrivacy,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create room');
      }

      const roomLink = `${window.location.origin}/room/${data.room.roomCode}`;
      setRoomCreated({
        roomCode: data.room.roomCode,
        link: roomLink,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (roomCreated) {
      navigator.clipboard.writeText(roomCreated.link);
    }
  };

  const handleClose = () => {
    setTitle(meetingTitle || '');
    setAgreedToPrivacy(false);
    setError(null);
    setRoomCreated(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {roomCreated ? 'Room Created!' : 'Create Shared Room'}
              </h2>
              <p className="text-sm text-gray-500">
                {roomCreated ? 'Share this link with your team' : 'Share action items with your team'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!roomCreated ? (
            <>
              {/* Room Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q1 Planning Meeting - Jan 2025"
                  className="w-full px-4 py-2 text-indigo-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Summary */}
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-indigo-900 mb-2">What you're sharing:</h3>
                <ul className="space-y-2 text-sm text-indigo-700">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    <span>{actionItems.length} action items</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    <span>Assignees and deadlines</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    <span>Task status tracking</span>
                  </li>
                </ul>
              </div>

              {/* Privacy Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <h4 className="font-semibold mb-2">Privacy & Data Storage Notice</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Action items will be stored on our secure servers to enable team collaboration</li>
                      <li>Anyone with the room link can view and edit action items</li>
                      <li>The original meeting transcript is NOT stored or shared</li>
                      <li>Rooms automatically expire after 90 days</li>
                      <li>You can delete the room anytime from your dashboard</li>
                      <li>We never share your data with third parties</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Privacy Agreement Checkbox */}
              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    I understand and agree that the action items from this meeting will be stored on VeriAct's servers 
                    to enable team collaboration. I confirm that this data does not contain sensitive personal information.
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !agreedToPrivacy}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Create Room</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success View */}
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Room Created Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  Share this link with your team members
                </p>

                {/* Room Code Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Room Code</p>
                  <p className="text-2xl font-mono font-bold text-indigo-600">
                    {roomCreated.roomCode}
                  </p>
                </div>

                {/* Shareable Link */}
                <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-indigo-900">Shareable Link</p>
                    <button
                      onClick={handleCopyLink}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Copy Link
                    </button>
                  </div>
                  <p className="text-sm text-indigo-700 break-all font-mono">
                    {roomCreated.link}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Expires in 90 days</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Unlimited members</p>
                  </div>
                  <div className="text-center">
                    <LinkIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Link-based access</p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}