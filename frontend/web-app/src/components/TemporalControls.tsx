import React from 'react';

interface TemporalControlsProps {
  isBlinkActive: boolean;
  onToggleBlink: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  fps: number;
  onChangeFps: (v: number) => void;
  epochIdx: number;
  totalEpochs: number;
  onScrub: (v: number) => void;
  curFilename: string;
  stretch: string;
  onChangeStretch: (v: string) => void;
  minCutPercent: number;
  onChangeMinCutPercent: (v: number) => void;
  maxCutPercent: number;
  onChangeMaxCutPercent: (v: number) => void;
  colormap: string;
  onChangeColormap: (v: string) => void;
  selectedDetector: string;
  onChangeDetector: (v: string) => void;
  cleanImages: boolean;
  onChangeCleanImages: (v: boolean) => void;
}

export const TemporalControls: React.FC<TemporalControlsProps> = ({
  isBlinkActive,
  onToggleBlink,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  fps,
  onChangeFps,
  epochIdx,
  totalEpochs,
  onScrub,
  curFilename,
  stretch,
  onChangeStretch,
  minCutPercent,
  onChangeMinCutPercent,
  maxCutPercent,
  onChangeMaxCutPercent,
  colormap,
  onChangeColormap,
  selectedDetector,
  onChangeDetector,
  cleanImages,
  onChangeCleanImages,
}) => {
  return (
    <div style={{
      padding: '14px',
      backgroundColor: '#0c1322',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      fontSize: '12px',
      fontFamily: 'monospace',
    }}>
      {/* Primary Mode Banner: Static View vs Blink Mode */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onToggleBlink}
            style={{
              padding: '6px 14px',
              backgroundColor: isBlinkActive ? '#38bdf8' : '#1e293b',
              color: isBlinkActive ? '#000' : '#cbd5e1',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isBlinkActive ? '⏱ Blink Comparator: Active' : '▶ Enable Blink Mode'}
          </button>

          <span style={{ color: '#94a3b8' }}>
            Active Exposure: <strong style={{ color: '#f8fafc' }}>{curFilename ? curFilename.replace('_cutout.fits', '') : `Epoch ${epochIdx + 1}/${totalEpochs}`}</strong>
          </span>
        </div>

        {isBlinkActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onTogglePlay}
              style={{
                padding: '5px 12px',
                backgroundColor: isPlaying ? '#e11d48' : '#059669',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={onPrev} style={{ padding: '5px 8px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer' }}>⏮</button>
            <button onClick={onNext} style={{ padding: '5px 8px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer' }}>⏭</button>
            <span style={{ color: '#64748b' }}>Speed:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={fps}
              onChange={(e) => onChangeFps(parseInt(e.target.value))}
              style={{ width: '60px', accentColor: '#38bdf8' }}
            />
            <span style={{ color: '#38bdf8', minWidth: '35px' }}>{fps} fps</span>
          </div>
        )}
      </div>

      {/* Epoch Stepper Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>
          <span>Epoch {epochIdx + 1} of {totalEpochs}</span>
          <span>{totalEpochs > 1 ? `Scrubbing ${totalEpochs} WCS-Aligned Exposures` : 'Single Exposure View'}</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalEpochs - 1)}
          value={epochIdx}
          disabled={totalEpochs <= 1}
          onChange={(e) => onScrub(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#38bdf8' }}
        />
      </div>

      {/* Astronomical Stretch & Calibration Slider Deck */}
      <div style={{
        padding: '12px',
        backgroundColor: '#070b14',
        borderRadius: '6px',
        border: '1px solid #1e293b',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        alignItems: 'center',
      }}>
        {/* Color Palette (Default: Inferno) */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>Render Mode / Palette</label>
          <select
            value={colormap}
            onChange={(e) => onChangeColormap(e.target.value)}
            style={{ width: '100%', padding: '5px 6px', backgroundColor: '#0c1322', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px' }}
          >
            <option value="rgb">Visible RGB Composite</option>
            <option value="gray">Greyscale (Raw Instrument)</option>
            <option value="inferno">Inferno (Default)</option>
            <option value="viridis">Viridis</option>
            <option value="magma">Magma</option>
            <option value="plasma">Plasma</option>
          </select>
        </div>

        {/* Stretch Selector */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>Stretch Algorithm</label>
          <select
            value={stretch}
            onChange={(e) => onChangeStretch(e.target.value)}
            style={{ width: '100%', padding: '5px 6px', backgroundColor: '#0c1322', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px' }}
          >
            <option value="linear">Linear</option>
            <option value="asinh">asinh (Astrophysical Softness)</option>
            <option value="log">Logarithmic</option>
          </select>
        </div>

        {/* Scientific cleaning selector */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>Image Processing</label>
          <select
            value={cleanImages ? 'cleaned' : 'raw'}
            onChange={(e) => onChangeCleanImages(e.target.value === 'cleaned')}
            style={{ width: '100%', padding: '5px 6px', backgroundColor: '#0c1322', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px' }}
          >
            <option value="raw">Raw FITS Measurements</option>
            <option value="cleaned">Quality-Masked + Background-Corrected</option>
          </select>
        </div>

        {/* Black Point Slider (Min Cut %) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>
            <span>Min Cut (Black Point)</span>
            <span style={{ color: '#38bdf8' }}>{minCutPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={minCutPercent}
            onChange={(e) => onChangeMinCutPercent(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* White Point Slider (Max Cut %) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>
            <span>Max Cut (White Point)</span>
            <span style={{ color: '#38bdf8' }}>{maxCutPercent}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="100"
            value={maxCutPercent}
            onChange={(e) => onChangeMaxCutPercent(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Detector Filter */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>Detector Filter</label>
          <select
            value={selectedDetector}
            onChange={(e) => onChangeDetector(e.target.value)}
            style={{ width: '100%', padding: '5px 6px', backgroundColor: '#0c1322', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px' }}
          >
            <option value="all">All Available Arrays</option>
            <option value="1">Array 1 (0.75-1.1µm)</option>
            <option value="2">Array 2 (1.1-1.6µm)</option>
            <option value="3">Array 3 (1.6-2.4µm)</option>
            <option value="4">Array 4 (2.4-3.8µm)</option>
            <option value="5">Array 5 (3.8-4.4µm)</option>
            <option value="6">Array 6 (4.4-5.0µm)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
