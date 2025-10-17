'use client';

import { useState, useEffect } from 'react';
import { Bot, ArrowLeft, Activity, Loader2 } from 'lucide-react';
import Link from 'next/link';

type TabType = 'invite' | 'activity';

export default function MeetingBotPage() {
  const [activeTab, setActiveTab] = useState<TabType>('invite');
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    features?: { canUseMeetingBot?: boolean };
    organizationName?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // States for invite tab
  const [meetingUrl, setMeetingUrl] = useState('');
  const [platform, setPlatform] = useState<'auto' | 'zoom' | 'google_meet' | 'teams'>('auto');
  const [scheduledTime, setScheduledTime] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [botRequestId, setBotRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // States for activity tab
  const [botRequests, setBotRequests] = useState<Array<{
    id: string;
    meeting_url: string;
    meeting_platform: string;
    status: string;
    scheduled_time: string | null;
    created_at: string;
    room_id: string | null;
    error_message: string | null;
    rooms?: { room_code: string; title: string };
  }>>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  useEffect(() => {
    if (activeTab === 'activity') {
      loadBotRequests();
      const interval = setInterval(loadBotRequests, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      setSubscriptionInfo(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBotRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch('/api/meeting-bot/requests');
      const data = await response.json();
      if (data.success) {
        setBotRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to load bot requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const detectPlatform = (url: string): string => {
    if (url.includes('zoom.us')) return 'zoom';
    if (url.includes('meet.google.com')) return 'google_meet';
    if (url.includes('teams.microsoft.com')) return 'teams';
    return 'auto';
  };

  const handleUrlChange = (url: string) => {
    setMeetingUrl(url);
    if (url) {
      const detected = detectPlatform(url);
      setPlatform(detected as typeof platform);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/meeting-bot/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingUrl,
          platform: platform === 'auto' ? null : platform,
          scheduledTime: scheduledTime || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite bot');
      }

      setBotRequestId(data.botRequest.id);
      setStep('success');
      loadBotRequests(); // Refresh activity
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setStep('error');
    }
  };

  const resetForm = () => {
    setStep('form');
    setMeetingUrl('');
    setPlatform('auto');
    setScheduledTime('');
    setBotRequestId(null);
    setErrorMessage('');
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'zoom': return '📹';
      case 'google_meet': return '🎥';
      case 'teams': return '💼';
      default: return '🤖';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Check if user has access
  if (!subscriptionInfo?.features?.canUseMeetingBot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto p-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-purple-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise Feature
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Meeting Bot is available exclusively for Enterprise plan organizations. 
              Automatically record meetings, generate transcripts, and extract action items.
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8 text-left max-w-xl mx-auto">
              <h3 className="font-semibold text-purple-900 mb-3">Enterprise Benefits:</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">✓</span>
                  Automated meeting bot for Zoom, Google Meet, and Teams
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">✓</span>
                  AI-powered transcription and action item extraction
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">✓</span>
                  Unlimited room sharing across your organization
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">✓</span>
                  Priority support and custom integrations
                </li>
              </ul>
            </div>

            <Link
              href="/checkout?plan=enterprise"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Enterprise
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting Bot</h1>
              <p className="text-gray-600">Automate your meeting recordings and action items</p>
            </div>
          </div>

          {subscriptionInfo?.organizationName && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 inline-flex items-center gap-2">
              <span className="text-purple-600 font-bold">🏢</span>
              <span className="text-sm text-purple-900">
                <strong>{subscriptionInfo.organizationName}</strong> · Enterprise Plan
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'invite'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bot className="w-5 h-5" />
              Invite Bot
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'activity'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-5 h-5" />
              Activity
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'invite' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            {step === 'form' && (
              <>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-2">
                    <span className="text-indigo-600 flex-shrink-0 mt-0.5">ℹ️</span>
                    <div className="text-sm text-indigo-900">
                      <strong>Enterprise Feature:</strong> VeriAct Bot will join your meeting, record it, and extract action items automatically.
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meeting URL *
                    </label>
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://zoom.us/j/123456789"
                      required
                      className="w-full px-4 py-3 border border-gray-300 text-indigo-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supports Zoom, Google Meet, Microsoft Teams
                    </p>
                  </div>

                  {meetingUrl && platform !== 'auto' && (
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                      <span className="text-2xl">{getPlatformIcon()}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {platform === 'zoom' && 'Zoom Meeting'}
                          {platform === 'google_meet' && 'Google Meet'}
                          {platform === 'teams' && 'Microsoft Teams'}
                        </p>
                        <p className="text-xs text-gray-600">Platform detected automatically</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Scheduled Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 text-indigo-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!meetingUrl}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Invite VeriAct Bot
                  </button>
                </div>
              </>
            )}

            {step === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inviting VeriAct Bot</h2>
                <p className="text-gray-600">Setting up your meeting assistant...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bot Invited Successfully!</h2>
                <p className="text-gray-600 mb-6">VeriAct Bot will join your meeting and extract action items automatically.</p>
                <button
                  onClick={resetForm}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Invite Another Bot
                </button>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✕</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Invite Bot</h2>
                <p className="text-red-600 mb-6">{errorMessage}</p>
                <button
                  onClick={resetForm}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bot Activity</h2>
              <p className="text-gray-600">Track your automated meeting recordings</p>
            </div>
            
            {loadingRequests && botRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              </div>
            ) : botRequests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Bot className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bot Requests Yet</h3>
                <p className="text-gray-600">Invite VeriAct Bot to your meetings to see activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {botRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {request.meeting_platform.replace('_', ' ').toUpperCase()} Meeting
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 break-all">{request.meeting_url}</p>
                        {request.room_id && request.rooms && (
                          <Link
                            href={`/dashboard?room=${request.rooms.room_code}`}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            View Room: {request.rooms.room_code} →
                          </Link>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        request.status === 'completed' ? 'bg-green-100 text-green-700' :
                        request.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}