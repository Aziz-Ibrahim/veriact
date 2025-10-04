import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database
export interface Room {
  id: string;
  room_code: string;
  title: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  settings: {
    access: 'link' | 'private';
  };
}

export interface RoomActionItem {
  id: string;
  room_id: string;
  task: string;
  assignee: string;
  deadline: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  meeting_title: string | null;
  created_at: string;
  updated_at: string;
}