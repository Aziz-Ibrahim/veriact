
export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  meetingTitle?: string;
}

export interface MeetingTranscript {
  id: string;
  title: string;
  content: string;
  uploadedAt: string;
  actionItems: ActionItem[];
}

export interface ExtractionResult {
  success: boolean;
  actionItems: ActionItem[];
  error?: string;
}

export interface StorageProvider {
  type: 'local' | 'gdrive' | 'dropbox';
  connected: boolean;
  email?: string;
}

export interface CreateRoomData {
  title: string;
  actionItems: ActionItem[];
  agreedToPrivacy: boolean;
}