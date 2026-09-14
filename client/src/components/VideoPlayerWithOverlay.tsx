import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Eye,
  SlidersHorizontal,
  Flame,
  Activity,
  Compass,
  Sparkles
} from 'lucide-react';
import { FrameTrackingData, VideoEvent, ShotDetail, PlayerMetrics } from '../types/basketball';

interface VideoPlayerWithOverlayProps {
  frames: FrameTrackingData[];
  durationSec: number;
  fps?: number;
  videoUrl?: string;
  shots?: ShotDetail[];
  players?: PlayerMetrics[];
  selectedPlayerId?: string;
  onSelectPlayer?: (playerId: string) => void;
  onJumpToMoment?: (timestamp: number) => void;
  onOpenManualCorrection?: () => void;
  className?: string;
}

export const VideoPlayerWithOverlay: React.FC<VideoPlayerWithOverlayProps> = ({
  frames,
  durationSec,
  fps = 60,
  videoUrl,
  shots = [],
  players = [],
  selectedPlayerId,
  onSelectPlayer,
  onJumpToMoment,
  onOpenManualCorrection,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(true);

  // Overlay layer visibility toggles
  const [showBoxes, setShowBoxes] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showBall, setShowBall] = useState(true);
  const [showCourtLines, setShowCourtLines] = useState(true);
  const [showSpeedHud, setShowSpeedHud] = useState(true);
  const [showShotArc, setShowShotArc] = useState(true);

  const [activeEvent, setActiveEvent] = useState<VideoEvent | null>(null);

  // Sync with duration
  const effectiveDuration = durationSec || (frames.length > 0 ? frames[frames.length - 1].timestamp : 24.5);

  // Current frame finder based on current playback time
  const getCurrentFrame = useCallback((): FrameTrackingData | null => {
    if (!frames || frames.length === 0) return null;
    let closest = frames[0];
    let minDiff = Math.abs(frames[0].timestamp - currentTime);
    for (let i = 1; i < frames.length; i++) {
      const diff = Math.abs(frames[i].timestamp - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = frames[i];
      }
    }
    return closest;
  }, [frames, currentTime]);

  // RequestAnimationFrame loop for simulated canvas animation when playing
  useEffect(() => {
    let animationFrameId: number;
    let lastStamp = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastStamp) / 1000;
        setCurrentTime(prev => {
          const next = prev + delta * playbackSpeed;
          if (next >= effectiveDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }
      lastStamp = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, effectiveDuration]);

  // Update video element if real video source exists
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoUrl) {
      video.playbackRate = playbackSpeed;
      if (isPlaying && video.paused) {
        video.play().catch(() => {});
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, playbackSpeed, videoUrl]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoUrl) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const jumpTo = (time: number) => {
    const clamped = Math.max(0, Math.min(effectiveDuration, time));
    setCurrentTime(clamped);
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = clamped;
    }
    onJumpToMoment?.(clamped);
  };

  const stepFrame = (forward: boolean) => {
    const frameDuration = 1 / fps;
    jumpTo(currentTime + (forward ? frameDuration : -frameDuration));
  };

  // Render Canvas Overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const currentFrame = getCurrentFrame();

    ctx.clearRect(0, 0, width, height);

    // If no videoUrl provided, draw a high-tech synthetic basketball court simulation
    if (!videoUrl) {
      // Court Floor Background
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, width, height);

      // Wood court texture lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Dynamic studio lighting vignette
      const vignette = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.7);
      vignette.addColorStop(0, 'rgba(15, 23, 42, 0)');
      vignette.addColorStop(1, 'rgba(7, 11, 20, 0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    }

    // 1. Draw Court Lines Overlay
    if (showCourtLines) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;

      // 3pt line arc simulation
      const hoopX = width / 2;
      const hoopY = height * 0.16;

      // Draw Key / Paint
      const keyW = width * 0.28;
      const keyH = height * 0.35;
      ctx.strokeRect(hoopX - keyW / 2, 0, keyW, keyH);

      // Free throw circle
      ctx.beginPath();
      ctx.arc(hoopX, keyH, width * 0.12, 0, Math.PI * 2);
      ctx.stroke();

      // 3-point line
      ctx.beginPath();
      ctx.arc(hoopX, hoopY, width * 0.38, Math.PI - 0.5, 0.5, true);
      ctx.stroke();

      // Rim & Backboard
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hoopX - 30, hoopY - 14);
      ctx.lineTo(hoopX + 30, hoopY - 14);
      ctx.stroke();

      // Rim ring
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hoopX, hoopY, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 2. Draw Shot Arc Trajectory
    if (showShotArc && currentFrame && currentFrame.shotArc && currentFrame.shotArc.length >= 2) {
      ctx.save();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 4]);
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      currentFrame.shotArc.forEach((pt, idx) => {
        const ax = (pt.x / 100) * width;
        const ay = (pt.y / 100) * height;
        if (idx === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
      });
      ctx.stroke();
      ctx.restore();
    }

    if (!currentFrame) return;

    // 3. Draw Player Bounding Boxes & Skeleton
    currentFrame.players.forEach(player => {
      const bx = (player.bbox.x / 100) * width;
      const by = (player.bbox.y / 100) * height;
      const bw = (player.bbox.width / 100) * width;
      const bh = (player.bbox.height / 100) * height;

      // 3A. Bounding Box
      if (showBoxes) {
        ctx.save();
        ctx.strokeStyle = player.teamColor || '#f97316';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Tech Corner brackets
        const bLen = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(bx, by + bLen);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + bLen, by);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(bx + bw - bLen, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw, by + bLen);
        ctx.stroke();

        // Player Tag Banner
        const tagText = `#${player.jerseyNumber} ${player.name} (${player.action.toUpperCase()})`;
        ctx.font = 'bold 10px monospace';
        const textW = ctx.measureText(tagText).width;
        ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
        ctx.fillRect(bx, by - 18, textW + 12, 16);
        ctx.fillStyle = player.teamColor || '#f97316';
        ctx.fillText(tagText, bx + 6, by - 6);

        ctx.restore();
      }

      // 3B. 17-Point Pose Skeleton
      if (showSkeleton && player.keypoints) {
        ctx.save();
        const kp = player.keypoints;

        const connections: [string, string, string][] = [
          ['left_shoulder', 'right_shoulder', '#38bdf8'],
          ['left_shoulder', 'left_elbow', '#38bdf8'],
          ['left_elbow', 'left_wrist', '#38bdf8'],
          ['right_shoulder', 'right_elbow', '#a855f7'],
          ['right_elbow', 'right_wrist', '#a855f7'],
          ['left_shoulder', 'left_hip', '#0ea5e9'],
          ['right_shoulder', 'right_hip', '#0ea5e9'],
          ['left_hip', 'right_hip', '#0ea5e9'],
          ['left_hip', 'left_knee', '#22c55e'],
          ['left_knee', 'left_ankle', '#22c55e'],
          ['right_hip', 'right_knee', '#22c55e'],
          ['right_knee', 'right_ankle', '#22c55e']
        ];

        // Draw bone lines
        ctx.lineWidth = 2.5;
        connections.forEach(([p1, p2, color]) => {
          if (kp[p1] && kp[p2] && kp[p1].confidence > 0.5 && kp[p2].confidence > 0.5) {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo((kp[p1].x / 100) * width, (kp[p1].y / 100) * height);
            ctx.lineTo((kp[p2].x / 100) * width, (kp[p2].y / 100) * height);
            ctx.stroke();
          }
        });

        // Draw joint nodes
        Object.entries(kp).forEach(([jointName, pt]) => {
          if (pt.confidence > 0.5) {
            const jx = (pt.x / 100) * width;
            const jy = (pt.y / 100) * height;
            ctx.fillStyle = jointName.includes('wrist') || jointName.includes('elbow') ? '#f97316' : '#ffffff';
            ctx.strokeStyle = '#070b14';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(jx, jy, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        });

        ctx.restore();
      }

      // 3C. Speed HUD
      if (showSpeedHud) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        const hudX = bx;
        const hudY = by + bh + 14;
        ctx.strokeRect(hudX, hudY - 10, 80, 15);
        ctx.fillRect(hudX, hudY - 10, 80, 15);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '9px monospace';
        ctx.fillText(`⚡ ${player.speedMph} mph`, hudX + 5, hudY + 1);
        ctx.restore();
      }
    });

    // 4. Draw Ball Tracking
    if (showBall && currentFrame.ball && currentFrame.ball.visible) {
      const ball = currentFrame.ball;
      const ballX = (ball.x / 100) * width;
      const ballY = (ball.y / 100) * height;

      ctx.save();
      // Glowing purple tracking box
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(ballX - 12, ballY - 12, 24, 24);

      // Trajectory halo
      const ballGlow = ctx.createRadialGradient(ballX, ballY, 2, ballX, ballY, 18);
      ballGlow.addColorStop(0, 'rgba(249, 115, 22, 0.9)');
      ballGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
      ballGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = ballGlow;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Ball circle
      ctx.fillStyle = '#ea580c';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Ball speed label
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#e9d5ff';
      ctx.fillText(`${ball.speedMph} mph`, ballX + 16, ballY + 3);

      ctx.restore();
    }
  }, [
    currentTime,
    getCurrentFrame,
    showBoxes,
    showSkeleton,
    showBall,
    showCourtLines,
    showSpeedHud,
    showShotArc,
    videoUrl
  ]);

  // Handle active event tooltip for timeline
  useEffect(() => {
    const curFrame = getCurrentFrame();
    if (curFrame && curFrame.events && curFrame.events.length > 0) {
      setActiveEvent(curFrame.events[0]);
    } else {
      setActiveEvent(null);
    }
  }, [currentTime, getCurrentFrame]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-xl glass-card border-slate-800 overflow-hidden shadow-2xl bg-slate-950 ${className}`}
    >
      {/* Video Viewport with Canvas Overlay */}
      <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center select-none group">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain"
            muted={isMuted}
            onTimeUpdate={handleVideoTimeUpdate}
            playsInline
          />
        ) : null}

        {/* Dynamic Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
        />

        {/* Floating Telemetry HUD (Top Bar) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="px-2.5 py-1 rounded bg-slate-900/85 backdrop-blur-md border border-slate-800 text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
              <span>{isPlaying ? 'AI TRACKING ACTIVE' : 'PAUSED'}</span>
            </span>

            <span className="px-2.5 py-1 rounded bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-300">
              FRAME: {Math.floor(currentTime * fps)} / {Math.floor(effectiveDuration * fps)}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {onOpenManualCorrection && (
              <button
                onClick={onOpenManualCorrection}
                className="px-2.5 py-1 rounded bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-orange-400 text-xs flex items-center gap-1 transition-colors"
                title="Manually correct player jersey, shot result or hoop coordinates"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Calibrate / Correct</span>
              </button>
            )}

            <button
              onClick={() => {
                if (containerRef.current?.requestFullscreen) {
                  containerRef.current.requestFullscreen();
                }
              }}
              className="p-1.5 rounded bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 text-xs transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Play Button Overlay on Hover/Paused */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute z-20 p-4 rounded-full bg-orange-500/90 hover:bg-orange-500 text-white shadow-2xl transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
          >
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          </button>
        )}

        {/* Live Detected Action Banner */}
        {activeEvent && (
          <div className="absolute bottom-4 left-4 z-20 p-2.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-purple-500/40 text-xs flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div>
              <div className="font-bold text-slate-100">{activeEvent.label}</div>
              <div className="text-[10px] text-purple-300">{activeEvent.description}</div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Timeline & Event Markers */}
      <div className="px-4 pt-3 pb-1 border-t border-slate-800/80 bg-slate-950/90">
        <div className="relative w-full h-8 flex items-center cursor-pointer group">
          {/* Progress Bar Track */}
          <div
            className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickFraction = (e.clientX - rect.left) / rect.width;
              jumpTo(clickFraction * effectiveDuration);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all"
              style={{ width: `${(currentTime / effectiveDuration) * 100}%` }}
            />
          </div>

          {/* Clickable Event Pins on Timeline */}
          {shots.map((shot) => {
            const leftPct = (shot.timestamp / effectiveDuration) * 100;
            const isMake = shot.result === 'make';
            return (
              <button
                key={shot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpTo(shot.timestamp);
                }}
                title={`Shot #${shot.shotNumber}: ${shot.result.toUpperCase()} (${shot.distanceFeet}ft)`}
                style={{ left: `${leftPct}%` }}
                className={`absolute -top-1 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-150 z-30 shadow-md ${
                  isMake ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                <span className="text-[8px] font-bold">{shot.shotNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Time stamps */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
          <span>{currentTime.toFixed(2)}s</span>
          <span>{effectiveDuration.toFixed(2)}s</span>
        </div>
      </div>

      {/* Playback Controls & Overlay Toggles */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Playback transport */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => stepFrame(false)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            title="Previous Frame (1/60s)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => jumpTo(currentTime - 5)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => jumpTo(currentTime + 5)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => stepFrame(true)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            title="Next Frame (1/60s)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="ml-2 flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            {[0.25, 0.5, 0.75, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  playbackSpeed === s ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* AI Overlay Layer Toggles */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-[10px] text-slate-500 uppercase font-mono mr-1">Overlays:</span>

          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2 py-1 rounded text-xs transition-colors border ${
              showBoxes
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Player Boxes
          </button>

          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`px-2 py-1 rounded text-xs transition-colors border ${
              showSkeleton
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Pose Skeleton
          </button>

          <button
            onClick={() => setShowBall(!showBall)}
            className={`px-2 py-1 rounded text-xs transition-colors border ${
              showBall
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Ball Trajectory
          </button>

          <button
            onClick={() => setShowCourtLines(!showCourtLines)}
            className={`px-2 py-1 rounded text-xs transition-colors border ${
              showCourtLines
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Court Lines
          </button>

          <button
            onClick={() => setShowSpeedHud(!showSpeedHud)}
            className={`px-2 py-1 rounded text-xs transition-colors border ${
              showSpeedHud
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Speed HUD
          </button>
        </div>
      </div>
    </div>
  );
};
