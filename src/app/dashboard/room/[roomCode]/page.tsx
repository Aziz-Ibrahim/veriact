import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import DashboardRoomClient from '@/components/DashboardRoomClient';

interface RoomPageProps {
  params: {
    roomCode: string;
  };
}

export default async function DashboardRoomPage({ params }: RoomPageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { roomCode } = params;

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .single();

  if (roomError || !room) {
    notFound();
  }

  const expiresAt = new Date(room.expires_at);
  if (expiresAt < new Date()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Expired</h2>
          <p className="text-gray-600">This room expired on {expiresAt.toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  const { data: actionItems } = await supabase
    .from('room_action_items')
    .select('*')
    .eq('room_id', room.id)
    .order('created_at', { ascending: false });

  return <DashboardRoomClient room={room} initialActionItems={actionItems || []} />;
}