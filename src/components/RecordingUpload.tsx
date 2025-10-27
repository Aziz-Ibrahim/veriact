'use client';

import { useState, useRef } from 'react';
import { Video, Mic, Upload, X, Loader2, CheckCircle, AlertCircle, FileAudio, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import { extractAudioFromVideo, compressAudio, isVideoFile, needsCompression } from '@/lib/audioExtractor';
import { needsChunking, estimateProcessingTime } from '@/lib/fileChunker';

interface RecordingUploadProps {
  onTranscriptionComplete: (transcript: string, meetingTitle: string) => void;
  onCancel: () => void;
}

type ProcessingStage = 'idle' | 'extracting' | 'compressing' | 'uploading' | 'transcribing' | 'complete' | 'error';

export default function RecordingUpload({ onTranscriptionComplete, onCancel }: RecordingUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [willChunk, setWillChunk] = useState(false);
  const [willExtractAudio, setWillExtractAudio] = useState(false);
  const [willCompress, setWillCompress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const SUPPORTED_AUDIO = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];
  const SUPPORTED_VIDEO = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const ALL_SUPPORTED = [...SUPPORTED_AUDIO, ...SUPPORTED_VIDEO];
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setProcessedFile(null);
    setStage('idle');
    setErrorMessage('');
    setProgress(0);

    // Auto-generate meeting title from filename
    if (!meetingTitle) {
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setMeetingTitle(title);
    }

    // Analyze what processing is needed
    const isVideo = isVideoFile(file);
    const needsComp = needsCompression(file);
    const needsChunk = needsChunking(file);

    setWillExtractAudio(isVideo);
    setWillCompress(!isVideo && needsComp);
    setWillChunk(needsChunk);

    // Estimate processing time
    const estimate = estimateProcessingTime(file, needsChunk);
    setEstimatedTime(estimate);

    console.log('📊 File analysis:', {
      isVideo,
      needsCompression: needsComp,
      needsChunking: needsChunk,
      estimatedTime: estimate,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStage('extracting');
    setErrorMessage('');

    try {
      let fileToProcess = selectedFile;

      // Step 1: Extract audio from video (client-side, FREE!)
      if (willExtractAudio) {
        toast('Extracting audio from video...');
        setProgress(10);
        fileToProcess = await extractAudioFromVideo(selectedFile, (prog) => {
          setProgress(10 + prog * 0.2); // 10-30%
        });
        console.log(`✅ Audio extracted: ${(fileToProcess.size / (1024 * 1024)).toFixed(2)}MB`);
      }

      // Step 2: Compress audio if needed (client-side, FREE!)
      if (willCompress || (willExtractAudio && needsCompression(fileToProcess))) {
        setStage('compressing');
        toast('Compressing audio...');
        setProgress(30);
        fileToProcess = await compressAudio(fileToProcess, (prog) => {
          setProgress(30 + prog * 0.2); // 30-50%
        });
        console.log(`✅ Audio compressed: ${(fileToProcess.size / (1024 * 1024)).toFixed(2)}MB`);
      }

      setProcessedFile(fileToProcess);

      // Step 3: Upload and transcribe (API call, costs money)
      setStage('uploading');
      setProgress(50);

      const formData = new FormData();
      formData.append('file', fileToProcess);
      formData.append('meetingTitle', meetingTitle || selectedFile.name);
      formData.append('needsChunking', willChunk.toString());

      const response = await fetch('/api/transcribe/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      setStage('transcribing');
      setProgress(70);

      if (data.transcript) {
        // Immediate response
        handleTranscriptionComplete(data.transcript);
      } else if (data.jobId) {
        // Async processing
        pollTranscriptionStatus(data.jobId);
      } else {
        throw new Error('Unexpected response from server');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setStage('error');
      setErrorMessage(error instanceof Error ? error.message : 'Processing failed');
      toast.error('Failed to process recording');
    }
  };

  const pollTranscriptionStatus = async (jobId: string) => {
    const maxAttempts = 120;
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
          if (data.progress) {
            setProgress(70 + data.progress * 0.3); // 70-100%
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            throw new Error('Transcription timeout');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setStage('error');
        setErrorMessage(error instanceof Error ? error.message : 'Transcription failed');
        toast.error('Transcription failed');
      }
    };

    poll();
  };

  const handleTranscriptionComplete = (transcript: string) => {
    setStage('complete');
    setProgress(100);
    toast.success('Transcription complete!');
    
    setTimeout(() => {
      onTranscriptionComplete(transcript, meetingTitle || selectedFile?.name || 'Meeting');
    }, 1000);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-8 h-8 text-gray-400" />;
    
    if (isVideoFile(selectedFile)) {
      return <Video className="w-8 h-8 text-purple-600" />;
    }
    return <Mic className="w-8 h-8 text-indigo-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStageMessage = () => {
    switch (stage) {
      case 'extracting':
        return 'Extracting audio from video...';
      case 'compressing':
        return 'Compressing audio...';
      case 'uploading':
        return 'Uploading to server...';
      case 'transcribing':
        return willChunk ? 'Transcribing (processing chunks)...' : 'Transcribing with AI...';
      default:
        return 'Processing...';
    }
  };

  const isProcessing = ['extracting', 'compressing', 'uploading', 'transcribing'].includes(stage);

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
          disabled={isProcessing}
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
          disabled={isProcessing}
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
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && stage === 'idle' && (
        <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
          <div className="flex items-start space-x-4 mb-4">
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
                  ⏱️ Estimated time: {estimatedTime}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setProcessedFile(null);
                setMeetingTitle('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-gray-400 hover:text-red-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Processing Plan */}
          {(willExtractAudio || willCompress || willChunk) && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">Processing Plan:</p>
              <div className="space-y-1 text-xs text-gray-700">
                {willExtractAudio && (
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Extract audio from video (in browser, free)</span>
                  </div>
                )}
                {willCompress && (
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-indigo-600" />
                    <span>Compress audio (in browser, free)</span>
                  </div>
                )}
                {willChunk && (
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-orange-600" />
                    <span>Split into chunks (file is large)</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-green-700 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Transcribe with AI</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
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
              Process Recording
            </button>
          </div>
        </div>
      )}

      {/* Processing States */}
      {isProcessing && (
        <div className="border-2 border-purple-200 rounded-lg p-8 bg-purple-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {getStageMessage()}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {stage === 'extracting' || stage === 'compressing'
                ? 'Processing in your browser' 
                : 'This may take a few minutes...'}
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-xs mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{progress}% complete</p>
            </div>

            {processedFile && (
              <p className="text-xs text-green-700 mt-4">
                ✅ Optimized: {formatFileSize(selectedFile!.size)} → {formatFileSize(processedFile.size)}
              </p>
            )}

            <p className="text-xs text-gray-500 mt-4">
              ☕ This runs in your browser - feel free to keep working!
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {stage === 'complete' && (
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
      {stage === 'error' && (
        <div className="border-2 border-red-200 rounded-lg p-8 bg-red-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Processing Failed
              </h3>
              <p className="text-sm text-red-700 mb-4">{errorMessage}</p>
              <button
                onClick={() => {
                  setStage('idle');
                  setSelectedFile(null);
                  setProcessedFile(null);
                  setErrorMessage('');
                  setProgress(0);
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
      {stage === 'idle' && !selectedFile && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💰 Cost-Saving Features:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Video → Audio extraction happens in your browser</li>
                <li>Audio compression reduces file size by 50-80% </li>
                <li>Large files automatically chunked for processing</li>
                <li>Only pay for transcription time (~$0.36 per hour)</li>
                <li>Your recording is deleted after processing (privacy first!)</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}