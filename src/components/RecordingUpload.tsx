'use client';

import { useState, useRef } from 'react';
import { Video, Mic, Upload, X, Loader2, CheckCircle, AlertCircle, FileAudio } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecordingUploadProps {
  onTranscriptionComplete: (transcript: string, meetingTitle: string) => void;
  onCancel: () => void;
}

export default function RecordingUpload({ onTranscriptionComplete, onCancel }: RecordingUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const SUPPORTED_AUDIO = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];
  const SUPPORTED_VIDEO = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const ALL_SUPPORTED = [...SUPPORTED_AUDIO, ...SUPPORTED_VIDEO];
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 500MB for Pro users.');
      return;
    }

    // Validate file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALL_SUPPORTED.includes(extension)) {
      toast.error(`Unsupported file type. Please use: ${ALL_SUPPORTED.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setStatus('idle');
    setErrorMessage('');

    // Auto-generate meeting title from filename
    if (!meetingTitle) {
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setMeetingTitle(title);
    }

    // Estimate processing time (rough estimate)
    const fileSizeMB = file.size / (1024 * 1024);
    const estimatedMinutes = Math.ceil(fileSizeMB / 10); // ~10MB per minute of processing
    setEstimatedTime(`${estimatedMinutes}-${estimatedMinutes + 2} minutes`);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setUploading(true);
    setErrorMessage('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('meetingTitle', meetingTitle || selectedFile.name);

      // Upload and transcribe
      const response = await fetch('/api/transcribe/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      if (data.jobId) {
        // Transcription job started - poll for completion
        setStatus('transcribing');
        setTranscribing(true);
        pollTranscriptionStatus(data.jobId);
      } else if (data.transcript) {
        // Immediate response (shouldn't happen with async processing)
        handleTranscriptionComplete(data.transcript);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      toast.error('Failed to upload recording');
    } finally {
      setUploading(false);
    }
  };

  const pollTranscriptionStatus = async (jobId: string) => {
    const maxAttempts = 120; // 10 minutes max (5 second intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/transcribe/status/${jobId}`);
        const data = await response.json();

        if (data.status === 'completed' && data.transcript) {
          handleTranscriptionComplete(data.transcript);
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Transcription failed');
        } else if (data.status === 'processing' || data.status === 'pending') {
          // Update progress if available
          if (data.progress) {
            setUploadProgress(data.progress);
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            throw new Error('Transcription timeout - please try again');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Transcription failed');
        setTranscribing(false);
        toast.error('Transcription failed');
      }
    };

    poll();
  };

  const handleTranscriptionComplete = (transcript: string) => {
    setStatus('complete');
    setTranscribing(false);
    toast.success('Transcription complete!');
    
    // Pass transcript back to parent
    setTimeout(() => {
      onTranscriptionComplete(transcript, meetingTitle || selectedFile?.name || 'Meeting');
    }, 1000);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-8 h-8 text-gray-400" />;
    
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (SUPPORTED_VIDEO.some(ext => ext.includes(extension || ''))) {
      return <Video className="w-8 h-8 text-purple-600" />;
    }
    return <Mic className="w-8 h-8 text-indigo-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileAudio className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Recording</h2>
            <p className="text-xs text-gray-500">Auto-transcribe with AI (Pro feature)</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          disabled={uploading || transcribing}
          className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Meeting Title Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Title (Optional)
        </label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="e.g., Q1 Planning Meeting"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-indigo-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          disabled={uploading || transcribing}
        />
      </div>

      {/* File Upload Area */}
      {!selectedFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-300 rounded-lg p-12 text-center hover:border-purple-400 transition cursor-pointer bg-purple-50/50"
        >
          <Upload className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            Click to upload audio or video
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported: MP4, MOV, MP3, WAV, M4A (max 500MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ALL_SUPPORTED.join(',')}
            onChange={handleFileSelect}
            disabled={uploading || transcribing}
          />
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && status === 'idle' && (
        <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                Size: {formatFileSize(selectedFile.size)}
              </p>
              {estimatedTime && (
                <p className="text-xs text-purple-700 mt-1">
                  ⏱️ Estimated processing time: {estimatedTime}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setMeetingTitle('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-gray-400 hover:text-red-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Change File
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Upload & Transcribe
            </button>
          </div>
        </div>
      )}

      {/* Processing States */}
      {(status === 'uploading' || status === 'transcribing') && (
        <div className="border-2 border-purple-200 rounded-lg p-8 bg-purple-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {status === 'uploading' ? 'Uploading...' : 'Transcribing with AI...'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {status === 'uploading' 
                ? 'Sending your recording to our servers...' 
                : 'Our AI is processing your recording. This may take a few minutes.'}
            </p>
            
            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="max-w-xs mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">{uploadProgress}% complete</p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              ☕ Grab a coffee - we'll email you when it's ready!
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === 'complete' && (
        <div className="border-2 border-green-200 rounded-lg p-8 bg-green-50 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Transcription Complete!
          </h3>
          <p className="text-sm text-gray-600">
            Extracting action items now...
          </p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="border-2 border-red-200 rounded-lg p-8 bg-red-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Transcription Failed
              </h3>
              <p className="text-sm text-red-700 mb-4">{errorMessage}</p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setSelectedFile(null);
                  setErrorMessage('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {status === 'idle' && !selectedFile && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Upload your meeting recording (audio or video)</li>
                <li>Our AI transcribes it automatically (5-10 minutes)</li>
                <li>Action items are extracted and ready to use</li>
                <li>Your recording is deleted after processing (privacy first!)</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}