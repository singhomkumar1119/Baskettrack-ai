import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../data/store.js';
import { videoProcessor, ProcessingProgress } from '../pipeline/videoProcessor.js';
import { AnalysisType, CourtPreset } from '../types/basketball.js';

export const analysisRouter = express.Router();

// List all analyses
analysisRouter.get('/', (_req, res) => {
  const analyses = dataStore.getAll();
  res.json(analyses);
});

// Get single analysis
analysisRouter.get('/:id', (req, res): void => {
  const analysis = dataStore.getById(req.params.id);
  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found' });
    return;
  }
  res.json(analysis);
});

// Start a new analysis
analysisRouter.post('/start', async (req, res): Promise<void> => {
  try {
    const {
      title,
      fileName,
      fileSizeBytes,
      durationSec = 22.0,
      resolution = '1920x1080',
      fps = 60,
      analysisType = 'shooting',
      courtPreset = 'nba',
      selectedPlayerId
    } = req.body;

    const analysisId = `analysis-${uuidv4()}`;

    // Create initial processing record
    const initialRecord = {
      id: analysisId,
      title: title || `Analysis - ${new Date().toLocaleDateString()}`,
      videoFileName: fileName || 'uploaded_video.mp4',
      videoUrl: req.body.videoUrl || '/api/videos/sample-curry.mp4',
      videoDurationSec: parseFloat(durationSec),
      resolution,
      fps: parseInt(fps, 10),
      fileSizeBytes: parseInt(fileSizeBytes, 10) || 45000000,
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      analysisType: analysisType as AnalysisType,
      courtPreset: courtPreset as CourtPreset,
      selectedPlayerId: selectedPlayerId || 'player-primary',
      status: 'processing' as const,
      progress: 0,
      stage: 'Queued in processing pipeline...',
      logs: [`[${new Date().toLocaleTimeString()}] Analysis job created`],
      overallPerformanceScore: 0,
      overallConfidenceScore: 0,
      overallConfidenceStatus: 'estimated' as const,
      players: [],
      shooting: {
        numShots: 0,
        madeShots: 0,
        missedShots: 0,
        shootingPercentage: 0,
        swishCount: 0,
        rimContactCount: 0,
        backboardContactCount: 0,
        avgShotDistanceFeet: 0,
        avgReleaseAngleDeg: 0,
        avgReleaseHeightFeet: 0,
        overallFormScore: 0,
        shotConsistencyScore: 0,
        shots: [],
        zoneBreakdown: []
      },
      ballHandling: {
        numDribbles: 0,
        dribbleFrequencyHz: 0,
        dribblingDurationSec: 0,
        possessionTimeSec: 0,
        avgBallSpeedKmh: 0,
        avgBallSpeedMph: 0,
        maxBallSpeedKmh: 0,
        maxBallSpeedMph: 0,
        turnoversCount: 0,
        passesDetected: 0,
        catchEvents: 0,
        avgTimeCatchToReleaseSec: 0,
        handUsage: { leftHandPct: 50, rightHandPct: 50 },
        dribbleTimeline: []
      },
      biomechanics: {
        kneeBendAvgDeg: 0,
        elbowAngleAvgDeg: 0,
        shoulderTiltAvgDeg: 0,
        hipAngleAvgDeg: 0,
        wristAngleAvgDeg: 0,
        maxVerticalJumpInches: 0,
        maxVerticalJumpCm: 0,
        bodyBalanceRating: 0,
        movementSymmetryPct: 0,
        catchToReleaseAvgSec: 0,
        coachingFeedback: []
      },
      frames: [],
      calibration: {
        courtWidthFeet: 50,
        courtLengthFeet: 94,
        pixelsPerMeter: 38.4,
        isCalibrated: true,
        hoopDetected: true
      }
    };

    dataStore.set(initialRecord);

    // Run processing asynchronously
    videoProcessor.processVideo(analysisId, {
      title: initialRecord.title,
      fileName: initialRecord.videoFileName,
      fileSizeBytes: initialRecord.fileSizeBytes,
      durationSec: initialRecord.videoDurationSec,
      resolution: initialRecord.resolution,
      fps: initialRecord.fps,
      analysisType: initialRecord.analysisType,
      courtPreset: initialRecord.courtPreset,
      selectedPlayerId: initialRecord.selectedPlayerId
    }).catch(err => {
      console.error(`Error processing video ${analysisId}:`, err);
      dataStore.update(analysisId, {
        status: 'failed',
        stage: 'Processing failed: ' + err.message
      });
    });

    res.status(201).json({
      success: true,
      analysisId,
      status: 'processing',
      record: initialRecord
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SSE progress stream
analysisRouter.get('/:id/progress', (req, res): void => {
  const { id } = req.params;
  const analysis = dataStore.getById(id);

  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // If already ready, send complete immediately
  if (analysis.status === 'ready' || analysis.status === 'failed') {
    res.write(`data: ${JSON.stringify({
      analysisId: id,
      progress: analysis.progress,
      stage: analysis.stage,
      log: 'Analysis is ' + analysis.status,
      isComplete: analysis.status === 'ready',
      isFailed: analysis.status === 'failed',
      record: analysis
    })}\n\n`);
    res.end();
    return;
  }

  const listener = (data: ProcessingProgress) => {
    if (data.analysisId === id) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (data.isComplete || data.isFailed) {
        videoProcessor.off('progress', listener);
        res.end();
      }
    }
  };

  videoProcessor.on('progress', listener);

  req.on('close', () => {
    videoProcessor.off('progress', listener);
  });
});

// Manual correction / update
analysisRouter.patch('/:id', (req, res): void => {
  const { id } = req.params;
  const existing = dataStore.getById(id);
  if (!existing) {
    res.status(404).json({ error: 'Analysis not found' });
    return;
  }

  const { title, manualCorrections, selectedPlayerId } = req.body;
  const patch: any = {};

  if (title) patch.title = title;
  if (selectedPlayerId) patch.selectedPlayerId = selectedPlayerId;

  if (manualCorrections) {
    patch.manualCorrections = {
      ...existing.manualCorrections,
      ...manualCorrections
    };

    // Apply player overrides if provided
    if (manualCorrections.playerOverrides) {
      const updatedPlayers = existing.players.map(p => {
        const override = manualCorrections.playerOverrides[p.id];
        if (override) {
          return {
            ...p,
            name: override.name || p.name,
            jerseyNumber: override.jerseyNumber !== undefined ? override.jerseyNumber : p.jerseyNumber
          };
        }
        return p;
      });
      patch.players = updatedPlayers;
    }

    // Apply shot overrides if provided (flip make / miss)
    if (manualCorrections.shotOverrides) {
      const updatedShots = existing.shooting.shots.map(s => {
        const override = manualCorrections.shotOverrides[s.id];
        if (override && override.result) {
          return {
            ...s,
            result: override.result
          };
        }
        return s;
      });

      const madeCount = updatedShots.filter(s => s.result === 'make').length;
      patch.shooting = {
        ...existing.shooting,
        shots: updatedShots,
        madeShots: madeCount,
        missedShots: updatedShots.length - madeCount,
        shootingPercentage: Math.round((madeCount / updatedShots.length) * 100)
      };
    }
  }

  const updated = dataStore.update(id, patch);
  res.json({ success: true, record: updated });
});

// Cancel analysis
analysisRouter.post('/:id/cancel', (req, res): void => {
  const { id } = req.params;
  videoProcessor.cancelJob(id);
  dataStore.update(id, {
    status: 'failed',
    stage: 'Cancelled by user'
  });
  res.json({ success: true, message: 'Analysis cancelled' });
});

// Delete analysis
analysisRouter.delete('/:id', (req, res): void => {
  const { id } = req.params;
  const deleted = dataStore.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Analysis not found' });
    return;
  }
  res.json({ success: true, message: 'Analysis deleted' });
});
