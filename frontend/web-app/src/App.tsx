import { useState, useEffect } from 'react';
import type { Target, FitsRecord, SedPoint } from './types';
import { BlinkCanvas } from './components/BlinkCanvas';
import { TargetSelector } from './components/TargetSelector';
import { TemporalControls } from './components/TemporalControls';
import { SpectralControls } from './components/SpectralControls';
import { ImageGallery } from './components/ImageGallery';
import { CandidateModal } from './components/CandidateModal';

// Vercel injects this at build time. Empty means same-origin, which works with
// the Vite development proxy and never points a deployed browser at localhost.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function App() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [fetchedExposures, setFetchedExposures] = useState<FitsRecord[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  // User input coordinates (Free text/numerical entry)
  const [ra, setRa] = useState<string>('133.785');
  const [dec, setDec] = useState<string>('-7.244');
  const [radius, setRadius] = useState<string>('0.08');
  const [maxResults, setMaxResults] = useState<string>('6');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Observation Modes: 'temporal' (default) | 'spectral'
  const [activeDomain, setActiveDomain] = useState<'temporal' | 'spectral'>('temporal');
  const [isBlinkActive, setIsBlinkActive] = useState<boolean>(false); // OFF by default
  const [epochIdx, setEpochIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // OFF by default
  const [fps, setFps] = useState<number>(2);

  // Raw Image Calibration Controls (Default: Visible RGB composite)
  const [stretch, setStretch] = useState<string>('linear');
  const [colormap, setColormap] = useState<string>('rgb'); // Visible RGB Composite by default
  const [minCutPercent, setMinCutPercent] = useState<number>(2); // Slider: 2%
  const [maxCutPercent, setMaxCutPercent] = useState<number>(98); // Slider: 98%
  const [selectedDetector, setSelectedDetector] = useState<string>('all');

  // Candidate Investigation State
  const [investigationMarker, setInvestigationMarker] = useState<{ x: number; y: number } | null>(null);
  const [candidateReport, setCandidateReport] = useState<any>(null);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);

  // Hyperspectral features
  const [rgbMode, setRgbMode] = useState<boolean>(false);
  const [sedData, setSedData] = useState<SedPoint[]>([]);

  // 1. Initial Load: Fetch targets and verified cutouts
  useEffect(() => {
    fetch(`${API_BASE}/api/targets`)
      .then((res) => res.json())
      .then((data: Target[]) => {
        if (Array.isArray(data)) {
          setTargets(data);
          setBackendConnected(true);
        }
      })
      .catch(() => setBackendConnected(false));

    fetch(`${API_BASE}/api/local_fits?ra=133.785&dec=-7.244`)
      .then((res) => res.json())
      .then((data: FitsRecord[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setFetchedExposures(data);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch Spectral SED data when switching to Spectral mode
  useEffect(() => {
    if (activeDomain === 'spectral') {
      fetch(`${API_BASE}/api/sed`)
        .then((res) => res.json())
        .then((data: SedPoint[]) => {
          if (Array.isArray(data)) setSedData(data);
        })
        .catch(() => {});
    }
  }, [activeDomain]);

  // 3. User Query Action: Perform search and ingest fresh cutouts
  const handlePerformQuery = () => {
    setIsQuerying(true);
    setInvestigationMarker(null);
    setCandidateReport(null);

    const queryParams = new URLSearchParams({
      ra,
      dec,
      radius,
      max_results: maxResults,
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    });
    const cutoutParams = new URLSearchParams(queryParams);
    cutoutParams.delete('max_results');
    cutoutParams.set('max_files', maxResults);

    fetch(`${API_BASE}/api/search?${queryParams}`)
      .then((res) => res.json())
      .then(() => fetch(`${API_BASE}/api/fetch_cutouts?${cutoutParams}`))
      .then((res) => res.json())
      .then(() => fetch(`${API_BASE}/api/local_fits?ra=${ra}&dec=${dec}`))
      .then((res) => res.json())
      .then((files: FitsRecord[]) => {
        if (Array.isArray(files) && files.length > 0) {
          setFetchedExposures(files);
          setEpochIdx(0);
        }
        setIsQuerying(false);
      })
      .catch(() => setIsQuerying(false));
  };

  // Explicit user selection of benchmark targets
  const handleSelectTarget = (t: Target) => {
    setSelectedTargetId(t.id);
    setRa(t.ra_deg.toString());
    setDec(t.dec_deg.toString());
    setEpochIdx(0);
    setInvestigationMarker(null);
    setCandidateReport(null);
  };

  // 4. Candidate Click Investigation Handler
  const handleCanvasClick = (normX: number, normY: number) => {
    setInvestigationMarker({ x: normX, y: normY });
    setIsInvestigating(true);
    fetch(`${API_BASE}/api/investigate?x=${normX}&y=${normY}&frame=${epochIdx}`)
      .then((res) => res.json())
      .then((report) => {
        setCandidateReport(report);
        setIsInvestigating(false);
      })
      .catch(() => setIsInvestigating(false));
  };

  // Filter fetched exposures strictly by detector if specified
  const filteredExposures = selectedDetector === 'all'
    ? fetchedExposures
    : fetchedExposures.filter((f) => String(f.detector) === String(selectedDetector));

  const totalEpochs = filteredExposures.length > 0 ? filteredExposures.length : 1;

  // Playback timer loop: ONLY runs when user has explicitly enabled Blink Mode and hit Play
  useEffect(() => {
    if (!isBlinkActive || !isPlaying || totalEpochs <= 1 || activeDomain !== 'temporal') return;
    const interval = setInterval(() => {
      setEpochIdx((prev) => (prev + 1) % totalEpochs);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [isBlinkActive, isPlaying, fps, totalEpochs, activeDomain]);

  // Active cutout file strictly bounded to query results
  const activeFitsFile = filteredExposures[epochIdx]?.filename || fetchedExposures[0]?.filename || '';

  // Streaming URL: Visible RGB composite by default, or single-band with chosen stretch/cuts
  const imageSrc =
    colormap === 'rgb'
      ? `${API_BASE}/api/rgb`
      : `${API_BASE}/api/render?filename=${encodeURIComponent(activeFitsFile)}&colormap=${colormap}&stretch=${stretch}&min_cut_percent=${minCutPercent}&max_cut_percent=${maxCutPercent}&clean=0`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070b14', color: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Clean Header */}
      <header style={{
        padding: '12px 24px',
        backgroundColor: '#0c1322',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/spherex-emblem.svg"
            alt="SPHEREx"
            style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#070b14', padding: '2px', border: '1px solid #1e293b' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#fff' }}>
                SPHEREx Observation Portal
              </h1>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontFamily: 'monospace' }}>
                NASA Space Apps
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
              Visible RGB Composite • WCS-Aligned Temporal Astrometry • Point-Source Centroiding
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: backendConnected ? '#10b981' : '#f59e0b' }} />
          <span style={{ color: backendConnected ? '#10b981' : '#f59e0b' }}>
            {backendConnected ? 'BACKEND: READY' : 'BACKEND: OFFLINE'}
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search & Ingestion Form */}
        <TargetSelector
          targets={targets}
          selectedTargetId={selectedTargetId}
          onSelectTarget={handleSelectTarget}
          ra={ra}
          dec={dec}
          radius={radius}
          maxResults={maxResults}
          startDate={startDate}
          endDate={endDate}
          onChangeRa={setRa}
          onChangeDec={setDec}
          onChangeRadius={setRadius}
          onChangeMaxResults={setMaxResults}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
          onQuery={handlePerformQuery}
          isQuerying={isQuerying}
        />

        {/* Queried Image Gallery Strip */}
        <ImageGallery
          exposures={filteredExposures}
          activeFilename={activeFitsFile}
          onSelectExposure={(_exp, idx) => {
            setEpochIdx(idx);
            setIsPlaying(false);
          }}
        />

        {/* Observation Dimension Toggle (Temporal vs Hyperspectral) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid #1e293b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Observation Mode:</span>
            <div style={{ display: 'inline-flex', backgroundColor: '#0c1322', border: '1px solid #1e293b', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => { setActiveDomain('temporal'); setRgbMode(false); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  backgroundColor: activeDomain === 'temporal' ? '#38bdf8' : 'transparent',
                  color: activeDomain === 'temporal' ? '#000' : '#94a3b8',
                }}
              >
                ⏱ Single Exposure / Temporal Astrometry
              </button>
              <button
                onClick={() => { setActiveDomain('spectral'); setIsPlaying(false); setIsBlinkActive(false); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  backgroundColor: activeDomain === 'spectral' ? '#a855f7' : 'transparent',
                  color: activeDomain === 'spectral' ? '#fff' : '#94a3b8',
                }}
              >
                🌈 Hyperspectral Slice (102 Bands)
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
            {filteredExposures.length} WCS-Aligned Cutout(s) Loaded
          </div>
        </div>

        {/* Workspace: Unobstructed Canvas & Responsive Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Left: Clean FITS Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <BlinkCanvas
              imageSrc={imageSrc}
              activeFilename={activeFitsFile}
              investigationMarker={investigationMarker}
              onCanvasClick={handleCanvasClick}
            />
          </div>

          {/* Right: Dimension & Calibration Controls */}
          <div>
            {activeDomain === 'temporal' ? (
              <TemporalControls
                isBlinkActive={isBlinkActive}
                onToggleBlink={() => {
                  const next = !isBlinkActive;
                  setIsBlinkActive(next);
                  if (!next) setIsPlaying(false);
                }}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onPrev={() => { setIsPlaying(false); setEpochIdx((prev) => (prev - 1 + totalEpochs) % totalEpochs); }}
                onNext={() => { setIsPlaying(false); setEpochIdx((prev) => (prev + 1) % totalEpochs); }}
                fps={fps}
                onChangeFps={setFps}
                epochIdx={epochIdx}
                totalEpochs={totalEpochs}
                onScrub={(idx) => { setIsPlaying(false); setEpochIdx(idx); }}
                curFilename={activeFitsFile}
                stretch={stretch}
                onChangeStretch={setStretch}
                minCutPercent={minCutPercent}
                onChangeMinCutPercent={setMinCutPercent}
                maxCutPercent={maxCutPercent}
                onChangeMaxCutPercent={setMaxCutPercent}
                colormap={colormap}
                onChangeColormap={setColormap}
                selectedDetector={selectedDetector}
                onChangeDetector={(d) => { setSelectedDetector(d); setEpochIdx(0); }}
              />
            ) : (
              <SpectralControls
                rgbMode={rgbMode}
                onToggleRgb={() => setRgbMode(!rgbMode)}
                sedData={sedData}
              />
            )}
          </div>
        </div>
      </main>

      {/* Candidate Investigation Report Modal */}
      <CandidateModal
        report={candidateReport}
        isLoading={isInvestigating}
        onClose={() => setCandidateReport(null)}
      />
    </div>
  );
}

export default App;
