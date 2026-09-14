export type AnalysisType = 'shooting' | 'movement' | 'ball_handling' | 'full_game';
export type ConfidenceLevel = 'measured' | 'estimated' | 'insufficient_data';
export type CourtPreset = 'nba' | 'fiba' | 'ncaa' | 'highschool';

export interface Keypoint {
  x: number;
  y: number;
  confidence: number;
}

export interface PlayerBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedPlayer {
  id: string;
  name: string;
  jerseyNumber: number;
  teamColor: string;
  bbox: PlayerBoundingBox;
  keypoints: Record<string, Keypoint>;
  speedKmh: number;
  speedMph: number;
  action: 'standing' | 'walking' | 'jogging' | 'sprinting' | 'jumping' | 'shooting' | 'dribbling';
  isShooting: boolean;
  isDribbling: boolean;
}

export interface DetectedBall {
  x: number;
  y: number;
  visible: boolean;
  speedKmh: number;
  speedMph: number;
  status: 'held' | 'in_flight' | 'dribbling' | 'rim_bounce' | 'scored';
}

export interface VideoEvent {
  id: string;
  type: 'shot_attempt' | 'shot_made' | 'shot_miss' | 'dribble_burst' | 'sprint' | 'turnover' | 'jump';
  timestamp: number;
  label: string;
  description: string;
  playerId?: string;
  metadata?: Record<string, any>;
}

export interface FrameTrackingData {
  frameIndex: number;
  timestamp: number;
  players: DetectedPlayer[];
  ball: DetectedBall | null;
  hoop: { x: number; y: number; radius: number };
  shotArc?: { x: number; y: number }[];
  events: VideoEvent[];
}

export interface ShotDetail {
  id: string;
  shotNumber: number;
  timestamp: number;
  result: 'make' | 'miss';
  isSwish: boolean;
  distanceFeet: number;
  distanceMeters: number;
  zone: 'Paint' | 'Mid-Range' | 'Corner 3' | 'Top of Key 3' | 'Free Throw';
  courtX: number;
  courtY: number;
  releaseHeightMeters: number;
  releaseHeightFeet: number;
  releaseAngleDeg: number;
  shotSpeedMph: number;
  shotSpeedKmh: number;
  flightTimeSec: number;
  apexHeightMeters: number;
  apexHeightFeet: number;
  entryAngleDeg: number;
  jumpHeightInches: number;
  jumpHeightCm: number;
  kneeBendAngleDeg: number;
  elbowAngleDeg: number;
  shoulderAlignment: string;
  wristAngleDeg: number;
  followThroughDurationSec: number;
  bodyBalanceScore: number;
  landingDrift: string;
  shotPrepTimeSec: number;
  formScore: number;
  confidenceScore: number;
  confidenceStatus: ConfidenceLevel;
  feedback: string[];
}

export interface PlayerMetrics {
  id: string;
  name: string;
  jerseyNumber: number;
  team: string;
  color: string;
  estimatedHeightMeters: number;
  estimatedHeightFeet: string;
  heightConfidence: number;
  heightStatus: ConfidenceLevel;
  totalTimeOnCourtSec: number;
  totalDistanceMeters: number;
  totalDistanceFeet: number;
  avgSpeedKmh: number;
  avgSpeedMph: number;
  maxSpeedKmh: number;
  maxSpeedMph: number;
  walkingDistanceMeters: number;
  joggingDistanceMeters: number;
  sprintingDistanceMeters: number;
  numSprints: number;
  numAccelerations: number;
  numDecelerations: number;
  maxAccelerationMss: number;
  maxDecelerationMss: number;
  numStops: number;
  numDirectionChanges: number;
  avgDistancePerMinuteMeters: number;
  movementIntensity: number;
  playerLoad: number;
  activityTimeSec: {
    standing: number;
    walking: number;
    jogging: number;
    sprinting: number;
    jumping: number;
    resting: number;
  };
  heatmapData: Array<{ x: number; y: number; intensity: number }>;
  positionTrail: Array<{ x: number; y: number; timestamp: number }>;
  leftRightBalance: { left: number; right: number };
  positioning: { offensive: number; defensive: number; neutral: number };
  statusLabels: Record<string, ConfidenceLevel>;
  confidences: Record<string, number>;
}

export interface BallHandlingMetrics {
  numDribbles: number;
  dribbleFrequencyHz: number;
  dribblingDurationSec: number;
  possessionTimeSec: number;
  avgBallSpeedKmh: number;
  avgBallSpeedMph: number;
  maxBallSpeedKmh: number;
  maxBallSpeedMph: number;
  turnoversCount: number;
  passesDetected: number;
  catchEvents: number;
  avgTimeCatchToReleaseSec: number;
  handUsage: {
    leftHandPct: number;
    rightHandPct: number;
  };
  dribbleTimeline: Array<{ timestamp: number; hand: 'left' | 'right'; speedMph: number }>;
}

export interface ShootingAnalysisSummary {
  numShots: number;
  madeShots: number;
  missedShots: number;
  shootingPercentage: number;
  swishCount: number;
  rimContactCount: number;
  backboardContactCount: number;
  avgShotDistanceFeet: number;
  avgReleaseAngleDeg: number;
  avgReleaseHeightFeet: number;
  overallFormScore: number;
  shotConsistencyScore: number;
  shots: ShotDetail[];
  zoneBreakdown: Array<{
    zone: string;
    attempts: number;
    makes: number;
    percentage: number;
  }>;
}

export interface BiomechanicsMetrics {
  kneeBendAvgDeg: number;
  elbowAngleAvgDeg: number;
  shoulderTiltAvgDeg: number;
  hipAngleAvgDeg: number;
  wristAngleAvgDeg: number;
  maxVerticalJumpInches: number;
  maxVerticalJumpCm: number;
  bodyBalanceRating: number;
  movementSymmetryPct: number;
  catchToReleaseAvgSec: number;
  coachingFeedback: Array<{
    category: 'Elbow & Arm' | 'Legs & Dip' | 'Release & Arc' | 'Balance & Landing' | 'Timing';
    status: 'optimal' | 'warning' | 'needs_work';
    title: string;
    detail: string;
  }>;
}

export interface AnalysisRecord {
  id: string;
  title: string;
  videoFileName: string;
  videoUrl?: string;
  videoDurationSec: number;
  resolution: string;
  fps: number;
  fileSizeBytes: number;
  uploadDate: string;
  analysisType: AnalysisType;
  courtPreset: CourtPreset;
  selectedPlayerId: string;
  status: 'processing' | 'ready' | 'failed';
  progress: number;
  stage: string;
  logs: string[];
  overallPerformanceScore: number;
  overallConfidenceScore: number;
  overallConfidenceStatus: ConfidenceLevel;
  players: PlayerMetrics[];
  shooting: ShootingAnalysisSummary;
  ballHandling: BallHandlingMetrics;
  biomechanics: BiomechanicsMetrics;
  frames: FrameTrackingData[];
  calibration: {
    courtWidthFeet: number;
    courtLengthFeet: number;
    pixelsPerMeter: number;
    isCalibrated: boolean;
    hoopDetected: boolean;
  };
  manualCorrections?: {
    playerOverrides?: Record<string, { name?: string; jerseyNumber?: number }>;
    shotOverrides?: Record<string, { result?: 'make' | 'miss' }>;
    hoopAdjustment?: { x: number; y: number };
  };
}
