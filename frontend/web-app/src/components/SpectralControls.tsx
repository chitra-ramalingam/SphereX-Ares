import React from 'react';
import type { SedPoint } from '../types';

interface SpectralControlsProps {
  rgbMode: boolean;
  onToggleRgb: () => void;
  sedData: SedPoint[];
}

export const SpectralControls: React.FC<SpectralControlsProps> = ({
  rgbMode,
  onToggleRgb,
  sedData,
}) => {
  const maxFlux = Math.max(...sedData.map((d) => d.flux), 1.0);

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#090d16',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      fontSize: '12px',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#c084fc', fontWeight: 'bold' }}>🌈 102-Channel Hyperspectral Diagnostics</span>
        <button
          onClick={onToggleRgb}
          style={{
            padding: '6px 12px',
            backgroundColor: rgbMode ? '#10b981' : '#334155',
            color: rgbMode ? '#000' : '#fff',
            fontWeight: 'bold',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {rgbMode ? 'RGB Composite: ACTIVE' : 'Toggle 3-Band RGB'}
        </button>
      </div>

      {/* SED Sparkline */}
      {sedData.length > 0 && (
        <div style={{
          padding: '10px',
          backgroundColor: 'rgba(88, 28, 135, 0.15)',
          borderRadius: '6px',
          border: '1px solid rgba(147, 51, 234, 0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#d8b4fe' }}>
            <span>Spectral Energy Distribution (SED)</span>
            <span style={{ fontSize: '10px' }}>Flux vs Wavelength (0.75µm - 5.0µm)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '64px', borderBottom: '1px solid #581c87', paddingBottom: '4px' }}>
            {sedData.map((pt, idx) => {
              const heightPct = Math.max(10, Math.min(100, Math.round((pt.flux / maxFlux) * 100)));
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      height: `${heightPct}%`,
                      width: '100%',
                      backgroundColor: '#a855f7',
                      borderRadius: '2px 2px 0 0',
                    }}
                    title={`Array ${pt.detector}: ${pt.wavelength_um}µm - ${pt.flux} DN`}
                  />
                  <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>{pt.wavelength_um}µ</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
