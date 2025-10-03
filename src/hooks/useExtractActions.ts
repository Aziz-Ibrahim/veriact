import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { extractTextFromFile, validateTranscriptText } from '@/lib/fileProcessor';
import { ActionItem, MeetingTranscript } from '@/types';

export function useExtractActions() {
  const [error, setError] = useState<string | null>(null);
  const { addActionItems, addTranscript, setProcessing, isProcessing } = useStore();

  const extractActions = async (file: File, meetingTitle?: string) => {
    setError(null);
    setProcessing(true);

    try {
      // Step 1: Extract text from file
      const transcript = await extractTextFromFile(file);
      
      // Step 2: Validate transcript
      validateTranscriptText(transcript);

      // Step 3: Call API to extract action items
      const response = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          meetingTitle: meetingTitle || file.name.replace(/\.[^/.]+$/, ''),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract action items');
      }

      // Step 4: Store the results
      const meetingData: MeetingTranscript = {
        id: `meeting-${Date.now()}`,
        title: meetingTitle || file.name.replace(/\.[^/.]+$/, ''),
        content: transcript,
        uploadedAt: new Date().toISOString(),
        actionItems: data.actionItems,
      };

      addTranscript(meetingData);
      addActionItems(data.actionItems);

      // Step 5: Save to local storage (user's browser storage)
      saveToLocalStorage(meetingData);

      return {
        success: true,
        count: data.actionItems.length,
        actionItems: data.actionItems,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setProcessing(false);
    }
  };

  return {
    extractActions,
    isProcessing,
    error,
  };
}

// Helper function to save to browser's local storage
function saveToLocalStorage(meeting: MeetingTranscript) {
  try {
    const existingData = localStorage.getItem('veriact-meetings');
    const meetings: MeetingTranscript[] = existingData ? JSON.parse(existingData) : [];
    
    meetings.push(meeting);
    
    // Keep only last 50 meetings to avoid storage limits
    const recentMeetings = meetings.slice(-50);
    
    localStorage.setItem('veriact-meetings', JSON.stringify(recentMeetings));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
    // Non-critical error - don't throw
  }
}