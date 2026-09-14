import jsPDF from 'jspdf';
import { AnalysisRecord } from '../types/basketball';

export function exportToCSV(analysis: AnalysisRecord) {
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

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${analysis.videoFileName.replace(/\.[^/.]+$/, '')}_analysis.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(analysis: AnalysisRecord) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${analysis.videoFileName.replace(/\.[^/.]+$/, '')}_report.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(analysis: AnalysisRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primary = analysis.players[0];

  // Dark header banner
  doc.setFillColor(7, 11, 20);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Orange accent strip
  doc.setFillColor(249, 115, 22);
  doc.rect(0, 88, pageWidth, 4, 'F');

  // Header branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BASKETTRACK AI', 30, 42);

  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22);
  doc.text('ELITE COMPUTER VISION & BIOMECHANICAL REPORT', 30, 58);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Session: ${analysis.id}`, 30, 74);

  // Overall Score Badge
  doc.setFillColor(13, 21, 39);
  doc.roundedRect(pageWidth - 140, 20, 110, 55, 6, 6, 'F');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('PERFORMANCE SCORE', pageWidth - 132, 36);
  doc.setFontSize(24);
  doc.setTextColor(249, 115, 22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${analysis.overallPerformanceScore}`, pageWidth - 132, 62);
  doc.setFontSize(10);
  doc.setTextColor(34, 197, 94);
  doc.text('/100', pageWidth - 80, 62);

  let y = 120;

  // Session metadata box
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(analysis.title, 30, y);
  y += 18;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`File: ${analysis.videoFileName} | Duration: ${analysis.videoDurationSec}s | Resolution: ${analysis.resolution} @ ${analysis.fps} FPS`, 30, y);
  y += 24;

  // 4 Key Stats Cards
  const cardW = (pageWidth - 60 - 30) / 4;
  const metrics = [
    { label: 'FIELD GOAL %', val: `${analysis.shooting.shootingPercentage}%`, sub: `${analysis.shooting.madeShots}/${analysis.shooting.numShots} Made` },
    { label: 'AVG SPEED', val: `${primary?.avgSpeedMph || 0} mph`, sub: `Peak ${primary?.maxSpeedMph || 0} mph` },
    { label: 'TOTAL DISTANCE', val: `${primary?.totalDistanceFeet || 0} ft`, sub: `${primary?.numSprints || 0} Sprints` },
    { label: 'AI CONFIDENCE', val: `${analysis.overallConfidenceScore}%`, sub: 'Measured' }
  ];

  metrics.forEach((m, i) => {
    const cx = 30 + i * (cardW + 10);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardW, 56, 4, 4, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cx + 10, y + 16);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, cx + 10, y + 34);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(249, 115, 22);
    doc.text(m.sub, cx + 10, y + 47);
  });

  y += 80;

  // Shot Breakdown Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Shot-by-Shot Biomechanical Analysis', 30, y);
  y += 16;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(30, y, pageWidth - 60, 20, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('#', 38, y + 13);
  doc.text('Result', 60, y + 13);
  doc.text('Distance', 115, y + 13);
  doc.text('Rel Angle', 180, y + 13);
  doc.text('Rel Height', 245, y + 13);
  doc.text('Apex', 315, y + 13);
  doc.text('Elbow Angle', 375, y + 13);
  doc.text('Knee Dip', 445, y + 13);
  doc.text('Form Score', 510, y + 13);

  y += 24;

  // Table rows
  doc.setFont('helvetica', 'normal');
  analysis.shooting.shots.forEach((shot, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(30, y - 6, pageWidth - 60, 18, 'F');
    }

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${shot.shotNumber}`, 38, y + 6);

    // Make or miss color
    if (shot.result === 'make') {
      doc.setTextColor(22, 163, 74);
      doc.setFont('helvetica', 'bold');
      doc.text('MAKE', 60, y + 6);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text('MISS', 60, y + 6);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${shot.distanceFeet} ft`, 115, y + 6);
    doc.text(`${shot.releaseAngleDeg}°`, 180, y + 6);
    doc.text(`${shot.releaseHeightFeet} ft`, 245, y + 6);
    doc.text(`${shot.apexHeightFeet} ft`, 315, y + 6);
    doc.text(`${shot.elbowAngleDeg}°`, 375, y + 6);
    doc.text(`${shot.kneeBendAngleDeg}°`, 445, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(249, 115, 22);
    doc.text(`${shot.formScore}/100`, 510, y + 6);

    y += 18;
  });

  y += 20;

  // Coaching Feedback Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('AI Biomechanical Coaching Insights', 30, y);
  y += 16;

  analysis.biomechanics.coachingFeedback.slice(0, 4).forEach((item) => {
    doc.setFillColor(254, 242, 242);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(249, 115, 22);
    doc.text(`• [${item.category}] ${item.title}`, 35, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitText = doc.splitTextToSize(item.detail, pageWidth - 80);
    doc.text(splitText, 45, y);
    y += splitText.length * 11 + 6;
  });

  // Disclaimer footer
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(226, 232, 240);
  doc.line(30, footerY - 8, pageWidth - 30, footerY - 8);
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('DISCLAIMER: Measurements are computed via computer vision and geometric projection models for athletic performance training.', 30, footerY + 2);
  doc.text('Measurements are subject to camera resolution, lighting, and angle. This data does not constitute medical or healthcare advice.', 30, footerY + 12);

  doc.save(`${analysis.videoFileName.replace(/\.[^/.]+$/, '')}_BasketTrack_Report.pdf`);
}
