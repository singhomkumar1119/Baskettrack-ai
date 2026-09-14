import express from 'express';
import { dataStore } from '../data/store.js';

export const exportRouter = express.Router();

// Export as CSV
exportRouter.get('/:id/csv', (req, res): void => {
  const { id } = req.params;
  const analysis = dataStore.getById(id);

  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found' });
    return;
  }

  // Generate CSV rows
  const lines: string[] = [];
  lines.push('BasketTrack AI - Shot & Biomechanics Performance Log');
  lines.push(`Title,${analysis.title}`);
  lines.push(`Date,${analysis.uploadDate}`);
  lines.push(`Duration (sec),${analysis.videoDurationSec}`);
  lines.push(`Overall Performance Score,${analysis.overallPerformanceScore}`);
  lines.push(`Overall Confidence,${analysis.overallConfidenceScore}%`);
  lines.push('');
  lines.push('SHOT LOGS');
  lines.push('ShotNumber,Timestamp(s),Result,Distance(ft),ReleaseAngle(deg),ReleaseHeight(ft),ApexHeight(ft),EntryAngle(deg),KneeBend(deg),ElbowAngle(deg),FormScore,Confidence(%)');

  for (const shot of analysis.shooting.shots) {
    lines.push([
      shot.shotNumber,
      shot.timestamp,
      shot.result.toUpperCase(),
      shot.distanceFeet,
      shot.releaseAngleDeg,
      shot.releaseHeightFeet,
      shot.apexHeightFeet,
      shot.entryAngleDeg,
      shot.kneeBendAngleDeg,
      shot.elbowAngleDeg,
      shot.formScore,
      shot.confidenceScore
    ].join(','));
  }

  lines.push('');
  lines.push('PLAYER MOVEMENT METRICS');
  lines.push('PlayerName,TotalDistance(ft),AvgSpeed(mph),MaxSpeed(mph),Sprints,PlayerLoad,WorkloadScore');
  for (const p of analysis.players) {
    lines.push([
      `"${p.name}"`,
      p.totalDistanceFeet,
      p.avgSpeedMph,
      p.maxSpeedMph,
      p.numSprints,
      p.playerLoad,
      p.movementIntensity
    ].join(','));
  }

  const csvContent = lines.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${analysis.videoFileName.replace(/\.[^/.]+$/, '')}_analysis.csv"`);
  res.send(csvContent);
});

// Export as JSON
exportRouter.get('/:id/json', (req, res): void => {
  const { id } = req.params;
  const analysis = dataStore.getById(id);

  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found' });
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${analysis.videoFileName.replace(/\.[^/.]+$/, '')}_report.json"`);
  res.json(analysis);
});

// Read-only share link endpoint
exportRouter.get('/share/:id', (req, res): void => {
  const { id } = req.params;
  const analysis = dataStore.getById(id);

  if (!analysis) {
    res.status(404).json({ error: 'Shared report not found or expired' });
    return;
  }

  // Return sanitized read-only representation
  res.json({
    isReadOnly: true,
    shareTimestamp: new Date().toISOString(),
    analysis
  });
});
