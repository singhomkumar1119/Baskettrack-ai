# BasketTrack AI 🏀

> Modern AI-powered basketball video analysis and biomechanics platform.

BasketTrack AI processes basketball video footage frame-by-frame using computer vision, multi-object tracking, and 17-point skeletal pose estimation. It extracts detailed player kinematics, parabolic shot arcs, court position heatmaps, ball-handling metrics, and actionable coaching feedback.

---

## Key Features

1. **AI Video Player & Synchronized Overlays**:
   - 17-joint skeletal pose estimation (nose, shoulders, elbows, wrists, hips, knees, ankles) with color-coded bones.
   - Bounding boxes with jersey number recognition and real-time velocity HUD.
   - Parabolic ball trajectory arc tracking (purple glow trail, apex altitude marker, rim entry angle).
   - Real-world court homography lines (NBA 94x50ft, FIBA 28x15m, NCAA, High School).
   - Slow-motion playback (0.25x, 0.5x, 0.75x, 1x) and frame-by-frame stepping.
   - Interactive timeline markers with click-to-jump navigation.

2. **5-Tab Analytics Hub**:
   - **Overview**: Performance score, FG%, velocity, workload, and telemetry radar.
   - **Player Metrics & Court Heatmap**: Thermal position density clouds, position trails, sprint counts, acceleration/deceleration stats, and bilateral cut balance.
   - **Shooting Analysis & Arc**: Interactive 2D half-court shot chart (makes vs misses), 2D parabolic elevation graph, and shot-by-shot telemetry logs.
   - **Ball Handling & Control**: Dribble frequencies (Hz), ambidextrous hand usage split, possession times, and turnover tracking.
   - **Pose & Biomechanics**: 2D animated kinematics skeleton, elbow set-point angle, knee bend dip, shoulder tilt, vertical jump elevation, and coaching feedback.

3. **10 Complete Application Pages**:
   1. Landing Page (Features, specs, and 1-click demo launcher)
   2. Sign-up & Login Page (With 1-click sports coach demo profiles)
   3. User Dashboard (KPIs, storage tracker, recent video analysis grid)
   4. Video Upload Page (Drag & drop, metadata extraction, court presets, sample video picker)
   5. Processing & Analysis Page (10-stage AI pipeline visualizer with live terminal telemetry)
   6. Video Review Page (AI video player, timeline markers, manual correction dialog)
   7. Analytics Dashboard (Comprehensive 5-tab sports science hub)
   8. Player Comparison Page (Head-to-head comparison, dynamic deltas, dual shot charts)
   9. Saved Reports Page (Search, filter, rename, delete, and share link modal)
   10. User Settings Page (Court calibration presets, imperial/metric units, confidence threshold sliders)

4. **Multi-Format Reports & Exports**:
   - Styled PDF executive report generation with branded headers, stat cards, and shot breakdown.
   - Tabular raw CSV telemetry log export.
   - Full JSON structured analysis payload export.
   - Shareable read-only link and mobile courtside QR code preview.

5. **Manual Model Calibration**:
   - Override detected player jersey numbers and names.
   - Flip shot detection results (Make <-> Miss).
   - Calibrate court scale and hoop coordinates.

6. **Scientific Accuracy & Disclaimers**:
   - Color-coded badges for `Measured`, `Estimated`, and `Insufficient Data` with confidence percentages.
   - Prominent sports-science disclaimers noting measurements are athletic training estimates, not medical diagnoses.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas API, jsPDF
- **Backend**: Express.js, TypeScript, Multer, Server-Sent Events (SSE), SQLite/JSON datastore
- **Styling**: Dark navy background (`#070b14`), basketball-orange accents (`#f97316`), glassmorphism cards

---

## Quick Start

### 1. Run Backend Server (Port 3001)
```bash
cd server
npm install
npm run build
npm start
```

### 2. Run Frontend Client (Port 5173)
```bash
cd client
npm install
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) in your browser.
