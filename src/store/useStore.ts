import { create } from 'zustand';
import { ActionItem, MeetingTranscript, StorageProvider } from '@/types';

interface VeriActStore {
  transcripts: MeetingTranscript[];
  actionItems: ActionItem[];
  storageProvider: StorageProvider;
  isProcessing: boolean;
  
  // Actions
  addTranscript: (transcript: MeetingTranscript) => void;
  addActionItems: (items: ActionItem[]) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (id: string) => void;
  setStorageProvider: (provider: StorageProvider) => void;
  setProcessing: (processing: boolean) => void;
  clearData: () => void;
}

// Initialize state from localStorage if available
const loadFromLocalStorage = () => {
  if (typeof window === 'undefined') return { transcripts: [], actionItems: [] };
  
  try {
    const meetings = localStorage.getItem('veriact-meetings');
    if (meetings) {
      const parsedMeetings = JSON.parse(meetings);
      const allActionItems = parsedMeetings.flatMap((m: any) => m.actionItems || []);
      return {
        transcripts: parsedMeetings,
        actionItems: allActionItems,
      };
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return { transcripts: [], actionItems: [] };
};

const initialState = loadFromLocalStorage();

export const useStore = create<VeriActStore>((set) => ({
  transcripts: initialState.transcripts,
  actionItems: initialState.actionItems,
  storageProvider: { type: 'local', connected: true },
  isProcessing: false,

  addTranscript: (transcript) =>
    set((state) => ({
      transcripts: [...state.transcripts, transcript],
    })),

  addActionItems: (items) =>
    set((state) => ({
      actionItems: [...state.actionItems, ...items],
    })),

  updateActionItem: (id, updates) =>
    set((state) => {
      const updatedItems = state.actionItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      
      // Update localStorage
      syncToLocalStorage(state.transcripts, updatedItems);
      
      return { actionItems: updatedItems };
    }),

  deleteActionItem: (id) =>
    set((state) => {
      const filteredItems = state.actionItems.filter((item) => item.id !== id);
      
      // Update localStorage
      syncToLocalStorage(state.transcripts, filteredItems);
      
      return { actionItems: filteredItems };
    }),

  setStorageProvider: (provider) =>
    set({ storageProvider: provider }),

  setProcessing: (processing) =>
    set({ isProcessing: processing }),

  clearData: () => {
    // Clear localStorage too
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veriact-meetings');
    }
    set({
      transcripts: [],
      actionItems: [],
    });
  },
}));

// Helper to sync changes back to localStorage
function syncToLocalStorage(transcripts: MeetingTranscript[], actionItems: ActionItem[]) {
  if (typeof window === 'undefined') return;
  
  try {
    // Rebuild transcripts with updated action items
    const updatedTranscripts = transcripts.map(transcript => ({
      ...transcript,
      actionItems: actionItems.filter(item => item.meetingTitle === transcript.title),
    }));
    
    localStorage.setItem('veriact-meetings', JSON.stringify(updatedTranscripts));
  } catch (error) {
    console.error('Failed to sync to localStorage:', error);
  }
}