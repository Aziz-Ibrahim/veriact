import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RoomClient from '@/components/RoomClient';

interface RoomPageProps {
  params: {
    roomCode: string;
  };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomCode } = params;

  // Fetch room data
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .single();

  if (roomError || !room) {
    notFound();
  }

  // Check if room is expired
  const expiresAt = new Date(room.expires_at);
  const now = new Date();
  
  if (expiresAt < now) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Room Expired</h1>
          <p className="text-gray-600 mb-6">
            This room expired on {expiresAt.toLocaleDateString()}. Rooms are automatically deleted after 90 days.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Fetch action items
  const { data: actionItems, error: itemsError } = await supabase
    .from('room_action_items')
    .select('*')
    .eq('room_id', room.id)
    .order('created_at', { ascending: false });

  if (itemsError) {
    console.error('Error fetching action items:', itemsError);
  }

  return (
    <RoomClient
      room={room}
      initialActionItems={actionItems || []}
    />
  );
}