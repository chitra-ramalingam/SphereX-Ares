import React from 'react';
import type { FitsRecord } from '../types';

interface ImageGalleryProps {
  exposures: FitsRecord[];
  activeFilename: string;
  onSelectExposure: (exposure: FitsRecord, index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  exposures,
  activeFilename,
  onSelectExposure,
}) => {
  if (!exposures || exposures.length === 0) {
    return null;
  }

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#0c1322',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Queried Image Gallery ({exposures.length} Exposures)
        </span>
        <span style={{ fontSize: '10px', color: '#64748b' }}>
          Click an image card to inspect
        </span>
      </div>

      {/* Horizontal Scrollable Exposure Cards */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {exposures.map((exp, idx) => {
          const isActive = exp.filename === activeFilename;
          return (
            <div
              key={exp.filename}
              onClick={() => onSelectExposure(exp, idx)}
              style={{
                minWidth: '130px',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : '#070b14',
                border: isActive ? '1px solid #38bdf8' : '1px solid #1e293b',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: isActive ? '#38bdf8' : '#e2e8f0' }}>
                  Epoch {idx + 1}
                </span>
                <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '3px', backgroundColor: '#1e293b', color: '#94a3b8' }}>
                  D{exp.detector}
                </span>
              </div>

              <div style={{ fontSize: '9px', color: '#64748b' }}>
                {exp.date_obs ? exp.date_obs.replace('T', ' ').slice(0, 16) : `MJD ${exp.mjd.toFixed(1)}`}
              </div>

              <div style={{ fontSize: '9px', color: '#38bdf8' }}>
                λ: {exp.wavelength_um.toFixed(2)} µm
              </div>

              <div style={{ fontSize: '8px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {exp.obs_id || exp.filename.slice(0, 15)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
