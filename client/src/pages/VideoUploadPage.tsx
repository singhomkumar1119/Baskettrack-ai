import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Play,
  Crosshair,
  Activity,
  Compass,
  Users,
  Film,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AnalysisType, CourtPreset } from '../types/basketball';
import { uploadVideoFile, startNewAnalysis } from '../services/api';

interface VideoUploadPageProps {
  onStartProcessing: (analysisId: string) => void;
  onLaunchSample: (sampleId: string) => void;
}

export const VideoUploadPage: React.FC<VideoUploadPageProps> = ({
  onStartProcessing,
  onLaunchSample
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted metadata
  const [videoMetadata, setVideoMetadata] = useState<{
    fileName: string;
    fileSizeBytes: number;
    durationSec: number;
    resolution: string;
    fps: number;
    videoUrl?: string;
  } | null>(null);

  // Configuration options
  const [sessionTitle, setSessionTitle] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('shooting');
  const [courtPreset, setCourtPreset] = useState<CourtPreset>('nba');
  const [selectedPlayer, setSelectedPlayer] = useState('Primary Offensive Player');

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMessage(`Invalid format "${ext}". Supported video formats: MP4, MOV, AVI, WebM.`);
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setErrorMessage('File size exceeds 500 MB limit. Please compress or trim the video.');
      return;
    }

    setSelectedFile(file);
    setSessionTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));

    // Client-side video metadata extraction via temporary video object
    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = objectUrl;
    tempVideo.preload = 'metadata';

    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration || 22.0;
      const w = tempVideo.videoWidth || 1920;
      const h = tempVideo.videoHeight || 1080;

      setVideoMetadata({
        fileName: file.name,
        fileSizeBytes: file.size,
        durationSec: parseFloat(dur.toFixed(1)),
        resolution: `${w}x${h}`,
        fps: 60, // Standard sports telemetry FPS default
        videoUrl: objectUrl
      });
    };

    tempVideo.onerror = () => {
      // Fallback if browser can't decode audio/video codec directly
      setVideoMetadata({
        fileName: file.name,
        fileSizeBytes: file.size,
        durationSec: 24.0,
        resolution: '1920x1080',
        fps: 60,
        videoUrl: objectUrl
      });
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!videoMetadata) return;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Step 1: Upload to backend or local cache
      if (selectedFile) {
        setUploadProgress(50);
        await uploadVideoFile(selectedFile, {
          duration: videoMetadata.durationSec,
          width: parseInt(videoMetadata.resolution.split('x')[0], 10),
          height: parseInt(videoMetadata.resolution.split('x')[1], 10),
          fps: videoMetadata.fps
        });
      }

      setUploadProgress(85);

      // Step 2: Trigger async computer vision analysis pipeline
      const { analysisId } = await startNewAnalysis({
        title: sessionTitle || videoMetadata.fileName,
        fileName: videoMetadata.fileName,
        fileSizeBytes: videoMetadata.fileSizeBytes,
        durationSec: videoMetadata.durationSec,
        resolution: videoMetadata.resolution,
        fps: videoMetadata.fps,
        analysisType,
        courtPreset,
        videoUrl: videoMetadata.videoUrl
      });

      setUploadProgress(100);
      onStartProcessing(analysisId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate video analysis');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto px-4 lg:px-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Upload Basketball Footage for AI Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Computer vision extracts trajectory physics, joint kinematics, and player workload frame by frame.
        </p>
      </div>

      {/* Preset Samples Selector Bar (For instant zero-upload testing) */}
      <div className="p-4 rounded-xl glass-card border-orange-500/30 bg-orange-950/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-current" />
            No Video On Hand? Test with Instant Sample Footage:
          </span>
          <span className="text-[10px] text-slate-400">1-Click Pro Telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onLaunchSample('analysis-curry-stepback-3pt')}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
              Stephen Curry 3PT Clinic
            </div>
            <div className="text-[10px] text-slate-400">80% FG% • High Arc • 89° Elbow</div>
          </button>

          <button
            type="button"
            onClick={() => onLaunchSample('analysis-fastbreak-transition')}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
              Pick & Roll Fastbreak
            </div>
            <div className="text-[10px] text-slate-400">3 Players • 28.4 km/h Sprints</div>
          </button>

          <button
            type="button"
            onClick={() => onLaunchSample('analysis-free-throw-mechanics')}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
              Free Throw Biomechanics
            </div>
            <div className="text-[10px] text-slate-400">100% FT • 118° Dip • Zero Sway</div>
          </button>
        </div>
      </div>

      {/* Main Drag-and-Drop Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
          dragOver
            ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,.avi,.webm"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="text-base font-bold text-slate-100">
            {selectedFile ? selectedFile.name : 'Drag & drop basketball video here'}
          </div>
          <p className="text-xs text-slate-400">
            Supports MP4, MOV, AVI, WebM (up to 500 MB)
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          {selectedFile ? 'Choose Different File' : 'Browse Local Files'}
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Detected Video Metadata Card */}
      {videoMetadata && (
        <div className="p-5 rounded-2xl glass-card border-slate-700 bg-slate-900/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{videoMetadata.fileName}</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(videoMetadata.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Format Validated
            </span>
          </div>

          {/* Metadata Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">DURATION</span>
              <span className="text-slate-100 font-bold text-base">{videoMetadata.durationSec}s</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">RESOLUTION</span>
              <span className="text-slate-100 font-bold text-base">{videoMetadata.resolution}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">FRAME RATE</span>
              <span className="text-orange-400 font-bold text-base">{videoMetadata.fps} FPS</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">FRAMES TOTAL</span>
              <span className="text-purple-400 font-bold text-base">
                {Math.floor(videoMetadata.durationSec * videoMetadata.fps)}
              </span>
            </div>
          </div>

          {/* Analysis Configuration */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Analysis Session Name
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g. Shooting Clinic - Step-Back Reps"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none text-slate-100"
              />
            </div>

            {/* Analysis Type Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Select Analysis Focus Type:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { id: 'shooting', title: 'Shooting Analysis', desc: 'Arc physics, release point, knee dip & form score', icon: Crosshair },
                  { id: 'movement', title: 'Player Movement', desc: 'Sprints, acceleration cuts, deceleration & load', icon: Activity },
                  { id: 'ball_handling', title: 'Ball-Handling', desc: 'Dribble count, hand split & control speed', icon: Compass },
                  { id: 'full_game', title: 'Full Game / All-In', desc: 'Complete multi-object & biomechanical suite', icon: Layers }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = analysisType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setAnalysisType(type.id as AnalysisType)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-orange-500/15 border-orange-500 text-orange-400 shadow-md shadow-orange-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-xs text-slate-100">{type.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{type.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Court Preset & Multi-Player Focus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Court Dimension Preset (Homography)
                </label>
                <select
                  value={courtPreset}
                  onChange={(e) => setCourtPreset(e.target.value as CourtPreset)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none text-slate-200"
                >
                  <option value="nba">NBA Regulation (94′ × 50′)</option>
                  <option value="fiba">FIBA International (28m × 15m)</option>
                  <option value="ncaa">NCAA College (94′ × 50′)</option>
                  <option value="highschool">High School (84′ × 50′)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Player Tracking Focus
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none text-slate-200"
                >
                  <option value="Primary Offensive Player">Primary Offensive Player (Auto-Detect)</option>
                  <option value="Player with Ball">Ball-Dominant Player</option>
                  <option value="All Visible Players">Track All Detected Players Simultaneously</option>
                </select>
              </div>
            </div>

            {/* Upload Progress Bar if active */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Uploading & Initializing GPU Pipeline...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Start Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isUploading}
                onClick={handleStartAnalysis}
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Process Video with AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Recording Instructions Card */}
      <div className="p-5 rounded-2xl glass-card border-slate-800 space-y-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-wider text-xs">
          <Camera className="w-4 h-4" />
          <span>Optimal Camera Angle & Recording Advice</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Stable Mount:</strong> Use a tripod or rested phone mount. Rapid camera pan makes pixel-to-court calibration less reliable.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Court & Rim Visibility:</strong> Include both the player's full body and the 10ft rim in the video frame for automated shot trajectory tracking.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Lighting & Jersey:</strong> High-contrast indoor or outdoor lighting ensures clean 17-point skeletal pose detection and jersey number recognition.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Calibrated Distance:</strong> Keep court lines (3pt arc, key, baseline) visible for real-world foot/meter velocity conversion.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
