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

export const useStore = create<VeriActStore>((set) => ({
  transcripts: [],
  actionItems: [],
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
    set((state) => ({
      actionItems: state.actionItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  deleteActionItem: (id) =>
    set((state) => ({
      actionItems: state.actionItems.filter((item) => item.id !== id),
    })),

  setStorageProvider: (provider) =>
    set({ storageProvider: provider }),

  setProcessing: (processing) =>
    set({ isProcessing: processing }),

  clearData: () =>
    set({
      transcripts: [],
      actionItems: [],
    }),
}));