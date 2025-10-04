'use client';

import { ActionItem } from '@/types';
import { useStore } from '@/store/useStore';
import { Trash2, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { useState } from 'react';

interface ActionItemCardProps {
  item: ActionItem;
}

export default function ActionItemCard({ item }: ActionItemCardProps) {
  const { updateActionItem, deleteActionItem } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = () => {
    const statusFlow = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending',
    } as const;

    updateActionItem(item.id, { status: statusFlow[item.status] });
  };

  const handleDelete = () => {
    deleteActionItem(item.id);
    setShowDeleteConfirm(false);
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <button
              onClick={handleStatusChange}
              className="mt-1 hover:scale-110 transition"
              title="Change status"
            >
              {getStatusIcon()}
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
                {item.meetingTitle && (
                  <span className="text-xs text-gray-400">
                    from: {item.meetingTitle}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {item.status}
          </span>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded-lg"
              title="Delete action item"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}