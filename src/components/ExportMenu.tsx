'use client';

import { useState } from 'react';
import { Download, Calendar, Copy, FileJson, FileSpreadsheet, ChevronDown, Trash2 } from 'lucide-react';
import { ActionItem } from '@/types';
import { exportAsJSON, exportAsCSV, exportAsCalendar, copyToClipboard } from '@/lib/exportUtils';
import toast from 'react-hot-toast';

interface ExportMenuProps {
  actionItems: ActionItem[];
  onClearAfterExport?: () => void;
}

export default function ExportMenu({ actionItems }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (type: 'json' | 'csv' | 'calendar' | 'clipboard') => {
    try {
      switch (type) {
        case 'json':
          exportAsJSON(actionItems);
          break;
        case 'csv':
          exportAsCSV(actionItems);
          break;
        case 'calendar':
          exportAsCalendar(actionItems);
          break;
        case 'clipboard':
          await copyToClipboard(actionItems);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          break;
      }
      setIsOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Export failed');
    }
  };

  if (actionItems.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="py-2">
              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <FileJson className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Export as JSON</p>
                  <p className="text-xs text-gray-500">Backup & restore</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Export as CSV</p>
                  <p className="text-xs text-gray-500">Open in Excel</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('calendar')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Export to Calendar</p>
                  <p className="text-xs text-gray-500">Add deadlines to calendar</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('clipboard')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <Copy className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </p>
                  <p className="text-xs text-gray-500">Markdown format</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}