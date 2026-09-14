import { AnalysisRecord, FrameTrackingData, ShotDetail } from '../types/basketball.js';

// Helper to generate realistic frame tracking data for Curry's 3-point session
function generateCurryFrames(durationSec: number, fps: number): FrameTrackingData[] {
  const totalFrames = Math.floor(durationSec * fps);
  const frames: FrameTrackingData[] = [];
  // Sample every 4 frames (15 updates per second) for smooth playback and low memory
  const step = 4;

  const shotTimestamps = [3.2, 8.5, 13.8, 18.2, 22.0];
  const shotDetails = [
    { release: 3.2, land: 4.6, make: true, hoopX: 50, hoopY: 12 },
    { release: 8.5, land: 9.8, make: true, hoopX: 50, hoopY: 12 },
    { release: 13.8, land: 15.1, make: false, hoopX: 50, hoopY: 12 },
    { release: 18.2, land: 19.5, make: true, hoopX: 50, hoopY: 12 },
    { release: 22.0, land: 23.3, make: true, hoopX: 50, hoopY: 12 }
  ];

  for (let f = 0; f < totalFrames; f += step) {
    const t = f / fps;

    // Determine player position
    // Base position around perimeter (x: 25% - 75%, y: 55% - 75%)
    const cycle = Math.sin(t * 0.8);
    const px = 50 + cycle * 22; // moves side to side along 3pt arc
    const py = 62 + Math.cos(t * 1.1) * 6;

    // Check if currently shooting
    const activeShot = shotDetails.find(s => t >= s.release - 0.6 && t <= s.land + 0.5);
    const isShooting = !!activeShot;
    const isBallInFlight = activeShot && t >= activeShot.release && t <= activeShot.release + 1.2;
    const isDribbling = !isShooting && (t < 2.5 || (t > 5.0 && t < 7.8) || (t > 10.5 && t < 13.0));

    // Calculate simulated vertical dip and jump
    let jumpOffset = 0;
    let kneeAngle = 165;
    let elbowAngle = 88;

    if (activeShot) {
      const dt = t - activeShot.release;
      if (dt < 0) {
        // Dip phase
        jumpOffset = Math.sin((dt + 0.6) / 0.6 * Math.PI) * 4;
        kneeAngle = 112 + jumpOffset * 8;
        elbowAngle = 82;
      } else if (dt <= 0.8) {
        // Jump & release apex
        jumpOffset = -Math.sin(dt / 0.8 * Math.PI) * 26; // jump up 26px
        kneeAngle = 175;
        elbowAngle = 168; // follow through
      } else {
        // Landing
        jumpOffset = 0;
        kneeAngle = 150;
      }
    }

    // Keypoints normalized (0-100 scale on video frame)
    const headY = py - 22 + jumpOffset * 0.3;
    const shoulderY = py - 16 + jumpOffset * 0.3;
    const elbowRightX = px + 4;
    const elbowRightY = shoulderY + (isShooting ? -6 : 6);
    const wristRightX = px + (isShooting ? 5 : 4);
    const wristRightY = elbowRightY + (isShooting ? -8 : 6);

    const keypoints = {
      nose: { x: px, y: headY, confidence: 0.98 },
      left_shoulder: { x: px - 5, y: shoulderY, confidence: 0.97 },
      right_shoulder: { x: px + 5, y: shoulderY, confidence: 0.98 },
      left_elbow: { x: px - 8, y: shoulderY + 6, confidence: 0.94 },
      right_elbow: { x: elbowRightX, y: elbowRightY, confidence: 0.96 },
      left_wrist: { x: px - 9, y: shoulderY + 12, confidence: 0.93 },
      right_wrist: { x: wristRightX, y: wristRightY, confidence: 0.95 },
      left_hip: { x: px - 4, y: py - 4 + jumpOffset * 0.2, confidence: 0.96 },
      right_hip: { x: px + 4, y: py - 4 + jumpOffset * 0.2, confidence: 0.96 },
      left_knee: { x: px - 4, y: py + 7 + jumpOffset * 0.1, confidence: 0.95 },
      right_knee: { x: px + 4, y: py + 7 + jumpOffset * 0.1, confidence: 0.95 },
      left_ankle: { x: px - 4, y: py + 18 + jumpOffset * 0.05, confidence: 0.94 },
      right_ankle: { x: px + 4, y: py + 18 + jumpOffset * 0.05, confidence: 0.94 }
    };

    // Ball position
    let ballX = px + 4;
    let ballY = py + 2;
    let ballStatus: 'held' | 'in_flight' | 'dribbling' | 'rim_bounce' | 'scored' = 'held';

    if (isBallInFlight && activeShot) {
      const flightProgress = (t - activeShot.release) / 1.2;
      ballStatus = 'in_flight';
      // Parabolic flight towards hoop (50, 12)
      const startX = px + 5;
      const startY = py - 24 + jumpOffset * 0.3;
      const targetX = activeShot.hoopX + (activeShot.make ? 0 : 2.5);
      const targetY = activeShot.hoopY;

      ballX = startX + (targetX - startX) * flightProgress;
      // Parabolic height formula: h = 4 * apex * p * (1 - p)
      const arcHeight = 35; // px height
      const linearY = startY + (targetY - startY) * flightProgress;
      ballY = linearY - Math.sin(flightProgress * Math.PI) * arcHeight;

      if (flightProgress >= 0.95) {
        ballStatus = activeShot.make ? 'scored' : 'rim_bounce';
      }
    } else if (isDribbling) {
      ballStatus = 'dribbling';
      const bounce = Math.abs(Math.sin(t * 8));
      ballX = px + (cycle > 0 ? 6 : -6);
      ballY = py + 4 + bounce * 14;
    }

    const events: any[] = [];
    if (activeShot && Math.abs(t - activeShot.release) < 0.15) {
      events.push({
        id: `ev-shot-${activeShot.release}`,
        type: 'shot_attempt',
        timestamp: activeShot.release,
        label: '3PT Shot Release',
        description: 'Pull-up shot from deep beyond the arc'
      });
    }

    frames.push({
      frameIndex: f,
      timestamp: parseFloat(t.toFixed(2)),
      players: [
        {
          id: 'player-30',
          name: 'Stephen Curry',
          jerseyNumber: 30,
          teamColor: '#f59e0b',
          bbox: {
            x: px - 8,
            y: py - 26 + jumpOffset * 0.3,
            width: 16,
            height: 46
          },
          keypoints,
          speedKmh: parseFloat((isDribbling ? 14.5 + Math.sin(t) * 3 : isShooting ? 3.2 : 8.0).toFixed(1)),
          speedMph: parseFloat((isDribbling ? 9.0 : isShooting ? 2.0 : 5.0).toFixed(1)),
          action: isShooting ? 'shooting' : isDribbling ? 'dribbling' : 'jogging',
          isShooting,
          isDribbling
        }
      ],
      ball: {
        x: parseFloat(ballX.toFixed(1)),
        y: parseFloat(ballY.toFixed(1)),
        visible: true,
        speedKmh: isBallInFlight ? 32.4 : isDribbling ? 18.2 : 6.0,
        speedMph: isBallInFlight ? 20.1 : isDribbling ? 11.3 : 3.7,
        status: ballStatus
      },
      hoop: { x: 50, y: 12, radius: 4 },
      shotArc: [
        { x: px, y: py - 20 },
        { x: (px + 50) / 2, y: 8 },
        { x: 50, y: 12 }
      ],
      events
    });
  }

  return frames;
}

export const DEFAULT_ANALYSES: AnalysisRecord[] = [
  {
    id: 'analysis-curry-stepback-3pt',
    title: 'Stephen Curry - 3-Point Shot Arc & Biomechanics Breakdown',
    videoFileName: 'curry_deep_three_clinic.mp4',
    videoUrl: '/api/videos/sample-curry.mp4',
    videoDurationSec: 24.5,
    resolution: '1920x1080',
    fps: 60,
    fileSizeBytes: 48600000,
    uploadDate: '2026-09-12 14:22:00',
    analysisType: 'shooting',
    courtPreset: 'nba',
    selectedPlayerId: 'player-30',
    status: 'ready',
    progress: 100,
    stage: 'Analysis Completed',
    logs: [
      '[0.1s] Initializing GPU Computer Vision Pipeline...',
      '[0.4s] Video verified: 1920x1080 @ 60 FPS, Duration 24.5s',
      '[0.9s] Calibrating court homography: Baseline, 3pt Arc, Paint detected (Error < 0.4%)',
      '[1.4s] Hoop detected at normalized (0.50, 0.12), Rim diameter 18 inches',
      '[2.1s] Player detected: Bounding box tracked, Jersey #30 identified with 97.4% confidence',
      '[3.0s] 17-point pose estimation completed across 1,470 frames',
      '[4.2s] Detected 5 shot attempts (4 Made, 1 Missed - 80.0% FG%)',
      '[5.0s] Ball trajectory tracked: Parabolic apex 14.8ft, Entry angle 44.8 deg',
      '[5.8s] Biomechanical kinetic chain computed: Dip knee bend 112°, Set-point elbow 89°',
      '[6.2s] Performance index calculated: Overall Form Score 94/100 (Elite Class)',
      '[6.5s] Complete report ready and saved to persistent database.'
    ],
    overallPerformanceScore: 94,
    overallConfidenceScore: 96.8,
    overallConfidenceStatus: 'measured',
    players: [
      {
        id: 'player-30',
        name: 'Stephen Curry',
        jerseyNumber: 30,
        team: 'Golden State Warriors',
        color: '#f59e0b',
        estimatedHeightMeters: 1.88,
        estimatedHeightFeet: "6'2\"",
        heightConfidence: 96.2,
        heightStatus: 'measured',
        totalTimeOnCourtSec: 24.5,
        totalDistanceMeters: 142.8,
        totalDistanceFeet: 468.5,
        avgSpeedKmh: 9.4,
        avgSpeedMph: 5.8,
        maxSpeedKmh: 24.2,
        maxSpeedMph: 15.0,
        walkingDistanceMeters: 38.2,
        joggingDistanceMeters: 62.4,
        sprintingDistanceMeters: 42.2,
        numSprints: 4,
        numAccelerations: 9,
        numDecelerations: 8,
        maxAccelerationMss: 4.8,
        maxDecelerationMss: -5.1,
        numStops: 6,
        numDirectionChanges: 11,
        avgDistancePerMinuteMeters: 349.7,
        movementIntensity: 84,
        playerLoad: 38.6,
        activityTimeSec: {
          standing: 4.2,
          walking: 6.8,
          jogging: 8.5,
          sprinting: 3.2,
          jumping: 1.8,
          resting: 0.0
        },
        heatmapData: [
          { x: 50, y: 72, intensity: 0.95 },
          { x: 32, y: 64, intensity: 0.88 },
          { x: 68, y: 65, intensity: 0.91 },
          { x: 22, y: 55, intensity: 0.72 },
          { x: 78, y: 54, intensity: 0.75 },
          { x: 50, y: 50, intensity: 0.60 },
          { x: 40, y: 38, intensity: 0.45 },
          { x: 60, y: 39, intensity: 0.48 }
        ],
        positionTrail: [
          { x: 30, y: 68, timestamp: 1.0 },
          { x: 38, y: 65, timestamp: 4.0 },
          { x: 50, y: 72, timestamp: 8.5 },
          { x: 62, y: 66, timestamp: 13.0 },
          { x: 72, y: 58, timestamp: 18.0 },
          { x: 52, y: 70, timestamp: 22.0 }
        ],
        leftRightBalance: { left: 48.5, right: 51.5 },
        positioning: { offensive: 85.0, defensive: 10.0, neutral: 5.0 },
        statusLabels: {
          speed: 'measured',
          distance: 'measured',
          acceleration: 'measured',
          intensity: 'estimated',
          height: 'measured'
        },
        confidences: {
          speed: 97.4,
          distance: 98.1,
          pose: 96.8,
          shooting: 98.5
        }
      }
    ],
    shooting: {
      numShots: 5,
      madeShots: 4,
      missedShots: 1,
      shootingPercentage: 80.0,
      swishCount: 3,
      rimContactCount: 1,
      backboardContactCount: 1,
      avgShotDistanceFeet: 25.8,
      avgReleaseAngleDeg: 49.4,
      avgReleaseHeightFeet: 8.8,
      overallFormScore: 94,
      shotConsistencyScore: 96,
      shots: [
        {
          id: 'shot-1',
          shotNumber: 1,
          timestamp: 3.2,
          result: 'make',
          isSwish: true,
          distanceFeet: 26.2,
          distanceMeters: 7.98,
          zone: 'Top of Key 3',
          courtX: 50,
          courtY: 72,
          releaseHeightMeters: 2.68,
          releaseHeightFeet: 8.8,
          releaseAngleDeg: 50.1,
          shotSpeedMph: 20.4,
          shotSpeedKmh: 32.8,
          flightTimeSec: 1.22,
          apexHeightMeters: 4.42,
          apexHeightFeet: 14.5,
          entryAngleDeg: 45.8,
          jumpHeightInches: 18.4,
          jumpHeightCm: 46.7,
          kneeBendAngleDeg: 114,
          elbowAngleDeg: 89,
          shoulderAlignment: 'Square (+1.2° tilt)',
          wristAngleDeg: 78,
          followThroughDurationSec: 0.78,
          bodyBalanceScore: 96,
          landingDrift: '0.6 in forward (Ideal)',
          shotPrepTimeSec: 0.58,
          formScore: 97,
          confidenceScore: 98.2,
          confidenceStatus: 'measured',
          feedback: [
            'Release point is exceptionally consistent.',
            'Elbow tuck maintained exactly at 89°.',
            'Follow-through held through full ball descent.',
            'Landing drift provides perfect forward kinetic energy transfer.'
          ]
        },
        {
          id: 'shot-2',
          shotNumber: 2,
          timestamp: 8.5,
          result: 'make',
          isSwish: true,
          distanceFeet: 25.4,
          distanceMeters: 7.74,
          zone: 'Top of Key 3',
          courtX: 42,
          courtY: 69,
          releaseHeightMeters: 2.71,
          releaseHeightFeet: 8.9,
          releaseAngleDeg: 49.2,
          shotSpeedMph: 19.8,
          shotSpeedKmh: 31.9,
          flightTimeSec: 1.18,
          apexHeightMeters: 4.38,
          apexHeightFeet: 14.3,
          entryAngleDeg: 44.9,
          jumpHeightInches: 19.1,
          jumpHeightCm: 48.5,
          kneeBendAngleDeg: 112,
          elbowAngleDeg: 90,
          shoulderAlignment: 'Square (0.8° tilt)',
          wristAngleDeg: 80,
          followThroughDurationSec: 0.82,
          bodyBalanceScore: 98,
          landingDrift: '0.4 in forward (Optimal)',
          shotPrepTimeSec: 0.54,
          formScore: 98,
          confidenceScore: 97.9,
          confidenceStatus: 'measured',
          feedback: [
            'Flawless rhythmic dip into upward kinetic rise.',
            'Wrist snap angle creates optimal 3.2 Hz backspin.',
            'Clean swish with zero rim rattle.'
          ]
        },
        {
          id: 'shot-3',
          shotNumber: 3,
          timestamp: 13.8,
          result: 'miss',
          isSwish: false,
          distanceFeet: 27.6,
          distanceMeters: 8.41,
          zone: 'Top of Key 3',
          courtX: 62,
          courtY: 74,
          releaseHeightMeters: 2.62,
          releaseHeightFeet: 8.6,
          releaseAngleDeg: 46.8,
          shotSpeedMph: 21.2,
          shotSpeedKmh: 34.1,
          flightTimeSec: 1.15,
          apexHeightMeters: 4.12,
          apexHeightFeet: 13.5,
          entryAngleDeg: 42.1,
          jumpHeightInches: 16.5,
          jumpHeightCm: 41.9,
          kneeBendAngleDeg: 122,
          elbowAngleDeg: 84,
          shoulderAlignment: 'Slight right tilt (-3.4°)',
          wristAngleDeg: 72,
          followThroughDurationSec: 0.52,
          bodyBalanceScore: 84,
          landingDrift: '1.8 in right fade',
          shotPrepTimeSec: 0.68,
          formScore: 82,
          confidenceScore: 96.5,
          confidenceStatus: 'measured',
          feedback: [
            'Elbow flared slightly outward (84° set point).',
            'Release angle is 2.6° lower than your previous shots.',
            'Landing showed slight rightward lateral fade.',
            'Front rim contact on back iron.'
          ]
        },
        {
          id: 'shot-4',
          shotNumber: 4,
          timestamp: 18.2,
          result: 'make',
          isSwish: false,
          distanceFeet: 24.8,
          distanceMeters: 7.56,
          zone: 'Corner 3',
          courtX: 84,
          courtY: 52,
          releaseHeightMeters: 2.70,
          releaseHeightFeet: 8.85,
          releaseAngleDeg: 50.4,
          shotSpeedMph: 19.5,
          shotSpeedKmh: 31.4,
          flightTimeSec: 1.20,
          apexHeightMeters: 4.45,
          apexHeightFeet: 14.6,
          entryAngleDeg: 46.2,
          jumpHeightInches: 18.8,
          jumpHeightCm: 47.8,
          kneeBendAngleDeg: 110,
          elbowAngleDeg: 91,
          shoulderAlignment: 'Square (1.1° tilt)',
          wristAngleDeg: 79,
          followThroughDurationSec: 0.76,
          bodyBalanceScore: 95,
          landingDrift: '0.5 in forward',
          shotPrepTimeSec: 0.56,
          formScore: 95,
          confidenceScore: 97.4,
          confidenceStatus: 'measured',
          feedback: [
            'Corner step-back recovery into square shoulder line.',
            'High arc creates wide 46.2° entry window.',
            'Smooth soft rim roll in.'
          ]
        },
        {
          id: 'shot-5',
          shotNumber: 5,
          timestamp: 22.0,
          result: 'make',
          isSwish: true,
          distanceFeet: 25.1,
          distanceMeters: 7.65,
          zone: 'Top of Key 3',
          courtX: 34,
          courtY: 66,
          releaseHeightMeters: 2.69,
          releaseHeightFeet: 8.8,
          releaseAngleDeg: 49.8,
          shotSpeedMph: 20.0,
          shotSpeedKmh: 32.2,
          flightTimeSec: 1.21,
          apexHeightMeters: 4.40,
          apexHeightFeet: 14.4,
          entryAngleDeg: 45.3,
          jumpHeightInches: 18.2,
          jumpHeightCm: 46.2,
          kneeBendAngleDeg: 113,
          elbowAngleDeg: 89,
          shoulderAlignment: 'Square (0.5° tilt)',
          wristAngleDeg: 81,
          followThroughDurationSec: 0.80,
          bodyBalanceScore: 97,
          landingDrift: '0.6 in forward',
          shotPrepTimeSec: 0.52,
          formScore: 98,
          confidenceScore: 98.0,
          confidenceStatus: 'measured',
          feedback: [
            'Lightning 0.52s catch-and-shoot release time.',
            'Follow-through held consistently until ball clearance.',
            'Perfect swish without touching rim.'
          ]
        }
      ],
      zoneBreakdown: [
        { zone: 'Top of Key 3', attempts: 4, makes: 3, percentage: 75.0 },
        { zone: 'Corner 3', attempts: 1, makes: 1, percentage: 100.0 },
        { zone: 'Mid-Range', attempts: 0, makes: 0, percentage: 0.0 },
        { zone: 'Paint', attempts: 0, makes: 0, percentage: 0.0 }
      ]
    },
    ballHandling: {
      numDribbles: 42,
      dribbleFrequencyHz: 2.4,
      dribblingDurationSec: 17.5,
      possessionTimeSec: 19.8,
      avgBallSpeedKmh: 16.4,
      avgBallSpeedMph: 10.2,
      maxBallSpeedKmh: 34.1,
      maxBallSpeedMph: 21.2,
      turnoversCount: 0,
      passesDetected: 2,
      catchEvents: 5,
      avgTimeCatchToReleaseSec: 0.56,
      handUsage: {
        leftHandPct: 44.0,
        rightHandPct: 56.0
      },
      dribbleTimeline: [
        { timestamp: 1.2, hand: 'right', speedMph: 9.8 },
        { timestamp: 1.8, hand: 'left', speedMph: 11.2 },
        { timestamp: 2.4, hand: 'right', speedMph: 10.4 },
        { timestamp: 5.5, hand: 'right', speedMph: 12.1 },
        { timestamp: 6.2, hand: 'left', speedMph: 14.5 },
        { timestamp: 6.9, hand: 'right', speedMph: 13.0 },
        { timestamp: 10.8, hand: 'left', speedMph: 10.5 },
        { timestamp: 11.5, hand: 'right', speedMph: 11.8 }
      ]
    },
    biomechanics: {
      kneeBendAvgDeg: 114.2,
      elbowAngleAvgDeg: 88.6,
      shoulderTiltAvgDeg: 1.4,
      hipAngleAvgDeg: 142.0,
      wristAngleAvgDeg: 79.6,
      maxVerticalJumpInches: 19.1,
      maxVerticalJumpCm: 48.5,
      bodyBalanceRating: 94.2,
      movementSymmetryPct: 93.8,
      catchToReleaseAvgSec: 0.56,
      coachingFeedback: [
        {
          category: 'Elbow & Arm',
          status: 'optimal',
          title: 'Optimal 88.6° Set-Point Angle',
          detail: 'Your elbow is tucked nicely beneath the ball with minimal outward flaring during upward gather.'
        },
        {
          category: 'Legs & Dip',
          status: 'optimal',
          title: 'Deep Kinetic Energy Generation',
          detail: 'Knee bend averaged 114.2°, allowing powerful vertical kinetic chain transfer without wasting energy.'
        },
        {
          category: 'Release & Arc',
          status: 'optimal',
          title: 'High 49.4° Parabolic Launch',
          detail: '49.4° release angle gives maximum clearance into the rim, increasing effective basket diameter by ~18%.'
        },
        {
          category: 'Balance & Landing',
          status: 'warning',
          title: 'Slight Drift on Shot #3',
          detail: 'Shot #3 showed a 1.8 inch rightward fade upon landing. Keep both feet landing squarely on the footprint.'
        },
        {
          category: 'Timing',
          status: 'optimal',
          title: 'Elite 0.56s Catch-to-Release',
          detail: 'Release timing is within NBA elite guard standard (< 0.60s), preventing closeout contests.'
        }
      ]
    },
    frames: generateCurryFrames(24.5, 60),
    calibration: {
      courtWidthFeet: 50,
      courtLengthFeet: 94,
      pixelsPerMeter: 38.4,
      isCalibrated: true,
      hoopDetected: true
    }
  },
  {
    id: 'analysis-fastbreak-transition',
    title: 'Pick-and-Roll & Fastbreak Movement Dynamics',
    videoFileName: 'transition_fastbreak_drill.mp4',
    videoUrl: '/api/videos/sample-transition.mp4',
    videoDurationSec: 32.0,
    resolution: '1920x1080',
    fps: 60,
    fileSizeBytes: 62400000,
    uploadDate: '2026-09-11 18:45:00',
    analysisType: 'full_game',
    courtPreset: 'nba',
    selectedPlayerId: 'player-23',
    status: 'ready',
    progress: 100,
    stage: 'Analysis Completed',
    logs: [
      '[0.1s] Initializing Multi-Object Tracking Engine...',
      '[0.6s] Detected 3 players and 1 basketball simultaneously',
      '[1.2s] ByteTrack ID assignment: Player #23, Player #3, Player #11',
      '[2.4s] Court line perspective homography calibrated (FIBA/NBA court mapping)',
      '[3.8s] Player #23 logged peak sprint at 28.4 km/h (17.6 mph)',
      '[4.5s] Ball tracking identified 2 passes, 1 fastbreak layup make',
      '[5.3s] Generating high-density court positioning heatmaps',
      '[6.0s] Workload index calculated: Player Load 72.4 (High Intensity)',
      '[6.4s] Report generated successfully.'
    ],
    overallPerformanceScore: 89,
    overallConfidenceScore: 94.2,
    overallConfidenceStatus: 'measured',
    players: [
      {
        id: 'player-23',
        name: 'Player #23 (Wing / Forward)',
        jerseyNumber: 23,
        team: 'Home Gold',
        color: '#3b82f6',
        estimatedHeightMeters: 2.06,
        estimatedHeightFeet: "6'9\"",
        heightConfidence: 94.8,
        heightStatus: 'measured',
        totalTimeOnCourtSec: 32.0,
        totalDistanceMeters: 218.4,
        totalDistanceFeet: 716.5,
        avgSpeedKmh: 12.8,
        avgSpeedMph: 8.0,
        maxSpeedKmh: 28.4,
        maxSpeedMph: 17.6,
        walkingDistanceMeters: 45.0,
        joggingDistanceMeters: 92.4,
        sprintingDistanceMeters: 81.0,
        numSprints: 6,
        numAccelerations: 14,
        numDecelerations: 12,
        maxAccelerationMss: 5.6,
        maxDecelerationMss: -6.2,
        numStops: 9,
        numDirectionChanges: 16,
        avgDistancePerMinuteMeters: 409.5,
        movementIntensity: 91,
        playerLoad: 72.4,
        activityTimeSec: {
          standing: 3.5,
          walking: 7.2,
          jogging: 12.1,
          sprinting: 7.2,
          jumping: 2.0,
          resting: 0.0
        },
        heatmapData: [
          { x: 50, y: 85, intensity: 0.8 },
          { x: 45, y: 55, intensity: 0.95 },
          { x: 50, y: 25, intensity: 0.9 },
          { x: 50, y: 15, intensity: 0.99 },
          { x: 30, y: 40, intensity: 0.6 }
        ],
        positionTrail: [
          { x: 50, y: 88, timestamp: 2.0 },
          { x: 46, y: 60, timestamp: 8.0 },
          { x: 48, y: 35, timestamp: 14.0 },
          { x: 50, y: 14, timestamp: 20.0 }
        ],
        leftRightBalance: { left: 49.0, right: 51.0 },
        positioning: { offensive: 65.0, defensive: 25.0, neutral: 10.0 },
        statusLabels: {
          speed: 'measured',
          distance: 'measured',
          acceleration: 'measured',
          intensity: 'measured',
          height: 'estimated'
        },
        confidences: {
          speed: 95.8,
          distance: 96.2,
          pose: 93.4,
          shooting: 92.0
        }
      },
      {
        id: 'player-3',
        name: 'Player #3 (Big / Center)',
        jerseyNumber: 3,
        team: 'Home Gold',
        color: '#10b981',
        estimatedHeightMeters: 2.11,
        estimatedHeightFeet: "6'11\"",
        heightConfidence: 91.5,
        heightStatus: 'estimated',
        totalTimeOnCourtSec: 32.0,
        totalDistanceMeters: 172.0,
        totalDistanceFeet: 564.3,
        avgSpeedKmh: 9.8,
        avgSpeedMph: 6.1,
        maxSpeedKmh: 22.1,
        maxSpeedMph: 13.7,
        walkingDistanceMeters: 55.0,
        joggingDistanceMeters: 85.0,
        sprintingDistanceMeters: 32.0,
        numSprints: 3,
        numAccelerations: 8,
        numDecelerations: 8,
        maxAccelerationMss: 4.1,
        maxDecelerationMss: -4.5,
        numStops: 7,
        numDirectionChanges: 9,
        avgDistancePerMinuteMeters: 322.5,
        movementIntensity: 76,
        playerLoad: 54.0,
        activityTimeSec: {
          standing: 6.0,
          walking: 10.0,
          jogging: 12.0,
          sprinting: 3.0,
          jumping: 1.0,
          resting: 0.0
        },
        heatmapData: [
          { x: 50, y: 30, intensity: 0.9 },
          { x: 45, y: 20, intensity: 0.8 },
          { x: 55, y: 20, intensity: 0.85 }
        ],
        positionTrail: [
          { x: 50, y: 45, timestamp: 2.0 },
          { x: 52, y: 25, timestamp: 12.0 }
        ],
        leftRightBalance: { left: 47.0, right: 53.0 },
        positioning: { offensive: 70.0, defensive: 20.0, neutral: 10.0 },
        statusLabels: {
          speed: 'measured',
          distance: 'measured',
          acceleration: 'measured',
          intensity: 'estimated',
          height: 'estimated'
        },
        confidences: {
          speed: 92.0,
          distance: 93.5,
          pose: 91.0,
          shooting: 89.0
        }
      }
    ],
    shooting: {
      numShots: 2,
      madeShots: 2,
      missedShots: 0,
      shootingPercentage: 100.0,
      swishCount: 1,
      rimContactCount: 1,
      backboardContactCount: 1,
      avgShotDistanceFeet: 4.2,
      avgReleaseAngleDeg: 54.0,
      avgReleaseHeightFeet: 9.8,
      overallFormScore: 91,
      shotConsistencyScore: 88,
      shots: [
        {
          id: 'shot-tb-1',
          shotNumber: 1,
          timestamp: 21.4,
          result: 'make',
          isSwish: false,
          distanceFeet: 3.5,
          distanceMeters: 1.07,
          zone: 'Paint',
          courtX: 50,
          courtY: 14,
          releaseHeightMeters: 2.98,
          releaseHeightFeet: 9.8,
          releaseAngleDeg: 55.2,
          shotSpeedMph: 12.4,
          shotSpeedKmh: 20.0,
          flightTimeSec: 0.45,
          apexHeightMeters: 3.45,
          apexHeightFeet: 11.3,
          entryAngleDeg: 58.0,
          jumpHeightInches: 29.5,
          jumpHeightCm: 74.9,
          kneeBendAngleDeg: 128,
          elbowAngleDeg: 142,
          shoulderAlignment: 'Square',
          wristAngleDeg: 82,
          followThroughDurationSec: 0.45,
          bodyBalanceScore: 92,
          landingDrift: 'Balanced two-foot landing',
          shotPrepTimeSec: 0.35,
          formScore: 92,
          confidenceScore: 96.0,
          confidenceStatus: 'measured',
          feedback: [
            'Exceptional vertical elevation (29.5 inches).',
            'Strong two-handed gather off full sprint transition.',
            'Controlled soft glass bank.'
          ]
        }
      ],
      zoneBreakdown: [
        { zone: 'Paint', attempts: 2, makes: 2, percentage: 100.0 }
      ]
    },
    ballHandling: {
      numDribbles: 38,
      dribbleFrequencyHz: 3.1,
      dribblingDurationSec: 12.2,
      possessionTimeSec: 16.0,
      avgBallSpeedKmh: 22.4,
      avgBallSpeedMph: 13.9,
      maxBallSpeedKmh: 38.5,
      maxBallSpeedMph: 23.9,
      turnoversCount: 0,
      passesDetected: 4,
      catchEvents: 3,
      avgTimeCatchToReleaseSec: 0.48,
      handUsage: {
        leftHandPct: 35.0,
        rightHandPct: 65.0
      },
      dribbleTimeline: [
        { timestamp: 5.0, hand: 'right', speedMph: 15.2 },
        { timestamp: 8.5, hand: 'right', speedMph: 18.4 }
      ]
    },
    biomechanics: {
      kneeBendAvgDeg: 126.0,
      elbowAngleAvgDeg: 135.0,
      shoulderTiltAvgDeg: 2.1,
      hipAngleAvgDeg: 138.0,
      wristAngleAvgDeg: 81.0,
      maxVerticalJumpInches: 29.5,
      maxVerticalJumpCm: 74.9,
      bodyBalanceRating: 91.5,
      movementSymmetryPct: 94.2,
      catchToReleaseAvgSec: 0.48,
      coachingFeedback: [
        {
          category: 'Balance & Landing',
          status: 'optimal',
          title: 'High Deceleration Stability',
          detail: 'Decelerated from 28.4 km/h to controlled takeoff in under 0.6 seconds with stable two-foot plant.'
        },
        {
          category: 'Legs & Dip',
          status: 'optimal',
          title: 'Explosive Vertical Jump (29.5 in)',
          detail: 'Deep knee pre-load generated 74.9 cm vertical leap on the break.'
        }
      ]
    },
    frames: generateCurryFrames(32.0, 60),
    calibration: {
      courtWidthFeet: 50,
      courtLengthFeet: 94,
      pixelsPerMeter: 38.4,
      isCalibrated: true,
      hoopDetected: true
    }
  },
  {
    id: 'analysis-free-throw-mechanics',
    title: 'Free Throw Routine & Kinetic Chain Consistency',
    videoFileName: 'freethrow_repetition_study.mp4',
    videoUrl: '/api/videos/sample-freethrow.mp4',
    videoDurationSec: 18.0,
    resolution: '1920x1080',
    fps: 60,
    fileSizeBytes: 34200000,
    uploadDate: '2026-09-10 11:15:00',
    analysisType: 'shooting',
    courtPreset: 'nba',
    selectedPlayerId: 'player-11',
    status: 'ready',
    progress: 100,
    stage: 'Analysis Completed',
    logs: [
      '[0.1s] Detecting Free Throw Line & Basketball Rim...',
      '[0.5s] Player #11 detected at 15ft regulation distance',
      '[1.1s] Analyzing pre-shot dribble rhythm: Exactly 3 bounces per rep (Standard Routine)',
      '[2.2s] Stance width measured: 1.12x shoulder width, 8° stagger',
      '[3.4s] Shot 1 through Shot 4 analyzed: 100% Free Throw accuracy',
      '[4.0s] Kinetic motion smoothness: 98.4% consistency index',
      '[4.6s] Analysis finalized.'
    ],
    overallPerformanceScore: 98,
    overallConfidenceScore: 98.4,
    overallConfidenceStatus: 'measured',
    players: [
      {
        id: 'player-11',
        name: 'Player #11 (Shooting Guard)',
        jerseyNumber: 11,
        team: 'Home Gold',
        color: '#8b5cf6',
        estimatedHeightMeters: 1.98,
        estimatedHeightFeet: "6'6\"",
        heightConfidence: 98.1,
        heightStatus: 'measured',
        totalTimeOnCourtSec: 18.0,
        totalDistanceMeters: 18.5,
        totalDistanceFeet: 60.7,
        avgSpeedKmh: 3.2,
        avgSpeedMph: 2.0,
        maxSpeedKmh: 6.8,
        maxSpeedMph: 4.2,
        walkingDistanceMeters: 14.5,
        joggingDistanceMeters: 4.0,
        sprintingDistanceMeters: 0.0,
        numSprints: 0,
        numAccelerations: 2,
        numDecelerations: 2,
        maxAccelerationMss: 1.8,
        maxDecelerationMss: -1.9,
        numStops: 4,
        numDirectionChanges: 2,
        avgDistancePerMinuteMeters: 61.7,
        movementIntensity: 42,
        playerLoad: 12.0,
        activityTimeSec: {
          standing: 12.0,
          walking: 5.0,
          jogging: 1.0,
          sprinting: 0.0,
          jumping: 0.0,
          resting: 0.0
        },
        heatmapData: [
          { x: 50, y: 48, intensity: 1.0 }
        ],
        positionTrail: [
          { x: 50, y: 48, timestamp: 1.0 }
        ],
        leftRightBalance: { left: 50.0, right: 50.0 },
        positioning: { offensive: 100.0, defensive: 0.0, neutral: 0.0 },
        statusLabels: {
          speed: 'measured',
          distance: 'measured',
          acceleration: 'measured',
          intensity: 'measured',
          height: 'measured'
        },
        confidences: {
          speed: 98.9,
          distance: 99.1,
          pose: 98.4,
          shooting: 99.2
        }
      }
    ],
    shooting: {
      numShots: 4,
      madeShots: 4,
      missedShots: 0,
      shootingPercentage: 100.0,
      swishCount: 4,
      rimContactCount: 0,
      backboardContactCount: 0,
      avgShotDistanceFeet: 15.0,
      avgReleaseAngleDeg: 51.5,
      avgReleaseHeightFeet: 8.4,
      overallFormScore: 99,
      shotConsistencyScore: 99,
      shots: [
        {
          id: 'ft-1',
          shotNumber: 1,
          timestamp: 4.2,
          result: 'make',
          isSwish: true,
          distanceFeet: 15.0,
          distanceMeters: 4.57,
          zone: 'Free Throw',
          courtX: 50,
          courtY: 48,
          releaseHeightMeters: 2.56,
          releaseHeightFeet: 8.4,
          releaseAngleDeg: 51.2,
          shotSpeedMph: 15.2,
          shotSpeedKmh: 24.5,
          flightTimeSec: 0.98,
          apexHeightMeters: 3.98,
          apexHeightFeet: 13.1,
          entryAngleDeg: 48.2,
          jumpHeightInches: 0.0,
          jumpHeightCm: 0.0,
          kneeBendAngleDeg: 118,
          elbowAngleDeg: 90,
          shoulderAlignment: 'Square (+0.2° tilt)',
          wristAngleDeg: 82,
          followThroughDurationSec: 0.95,
          bodyBalanceScore: 99,
          landingDrift: '0.0 in (Static Plant)',
          shotPrepTimeSec: 1.82,
          formScore: 99,
          confidenceScore: 99.4,
          confidenceStatus: 'measured',
          feedback: [
            'Robotic repetition: exact 118° knee dip matching previous attempts.',
            'Elbow aligned precisely along rim vertical plane.',
            'Swish with 48.2° steep entry angle.'
          ]
        },
        {
          id: 'ft-2',
          shotNumber: 2,
          timestamp: 9.0,
          result: 'make',
          isSwish: true,
          distanceFeet: 15.0,
          distanceMeters: 4.57,
          zone: 'Free Throw',
          courtX: 50,
          courtY: 48,
          releaseHeightMeters: 2.56,
          releaseHeightFeet: 8.4,
          releaseAngleDeg: 51.6,
          shotSpeedMph: 15.3,
          shotSpeedKmh: 24.6,
          flightTimeSec: 0.99,
          apexHeightMeters: 4.01,
          apexHeightFeet: 13.2,
          entryAngleDeg: 48.5,
          jumpHeightInches: 0.0,
          jumpHeightCm: 0.0,
          kneeBendAngleDeg: 119,
          elbowAngleDeg: 89,
          shoulderAlignment: 'Square (0.0° tilt)',
          wristAngleDeg: 83,
          followThroughDurationSec: 0.94,
          bodyBalanceScore: 99,
          landingDrift: '0.0 in (Static Plant)',
          shotPrepTimeSec: 1.80,
          formScore: 100,
          confidenceScore: 99.5,
          confidenceStatus: 'measured',
          feedback: [
            'Form score: 100/100.',
            'Zero variance in set point and release timing.',
            'Follow-through held through full trajectory.'
          ]
        }
      ],
      zoneBreakdown: [
        { zone: 'Free Throw', attempts: 4, makes: 4, percentage: 100.0 }
      ]
    },
    ballHandling: {
      numDribbles: 12,
      dribbleFrequencyHz: 1.2,
      dribblingDurationSec: 8.0,
      possessionTimeSec: 16.0,
      avgBallSpeedKmh: 8.2,
      avgBallSpeedMph: 5.1,
      maxBallSpeedKmh: 12.0,
      maxBallSpeedMph: 7.5,
      turnoversCount: 0,
      passesDetected: 0,
      catchEvents: 4,
      avgTimeCatchToReleaseSec: 2.1,
      handUsage: {
        leftHandPct: 0.0,
        rightHandPct: 100.0
      },
      dribbleTimeline: [
        { timestamp: 2.0, hand: 'right', speedMph: 5.0 },
        { timestamp: 2.6, hand: 'right', speedMph: 5.2 },
        { timestamp: 3.2, hand: 'right', speedMph: 5.1 }
      ]
    },
    biomechanics: {
      kneeBendAvgDeg: 118.5,
      elbowAngleAvgDeg: 89.5,
      shoulderTiltAvgDeg: 0.2,
      hipAngleAvgDeg: 146.0,
      wristAngleAvgDeg: 82.5,
      maxVerticalJumpInches: 0.0,
      maxVerticalJumpCm: 0.0,
      bodyBalanceRating: 99.2,
      movementSymmetryPct: 98.9,
      catchToReleaseAvgSec: 1.81,
      coachingFeedback: [
        {
          category: 'Balance & Landing',
          status: 'optimal',
          title: 'Rock-Solid 99.2% Balance Rating',
          detail: 'No body sway or foot pivot during the entire upward motion and release.'
        },
        {
          category: 'Elbow & Arm',
          status: 'optimal',
          title: '90° Set Point Perfection',
          detail: 'Elbow tuck matches textbook biomechanical guidance with 0° lateral rotation.'
        },
        {
          category: 'Release & Arc',
          status: 'optimal',
          title: 'Ideal 51.5° Launch Arc',
          detail: 'High 48°+ entry angle eliminates rim rim-outs and yields pure swishes.'
        }
      ]
    },
    frames: generateCurryFrames(18.0, 60),
    calibration: {
      courtWidthFeet: 50,
      courtLengthFeet: 94,
      pixelsPerMeter: 38.4,
      isCalibrated: true,
      hoopDetected: true
    }
  }
];
