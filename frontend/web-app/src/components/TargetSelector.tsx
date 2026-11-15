import React from 'react';
import type { Target } from '../types';

interface TargetSelectorProps {
  targets: Target[];
  selectedTargetId: string;
  onSelectTarget: (t: Target) => void;
  ra: string;
  dec: string;
  radius: string;
  maxResults: string;
  startDate: string;
  endDate: string;
  onChangeRa: (v: string) => void;
  onChangeDec: (v: string) => void;
  onChangeRadius: (v: string) => void;
  onChangeMaxResults: (v: string) => void;
  onChangeStartDate: (v: string) => void;
  onChangeEndDate: (v: string) => void;
  onQuery: () => void;
  isQuerying: boolean;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  ra,
  dec,
  radius,
  maxResults,
  startDate,
  endDate,
  onChangeRa,
  onChangeDec,
  onChangeRadius,
  onChangeMaxResults,
  onChangeStartDate,
  onChangeEndDate,
  onQuery,
  isQuerying,
}) => {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      backgroundColor: '#0c1322',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      fontSize: '12px',
    }}>
      {/* Optional Benchmark Target Quick-Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preset Benchmark Targets (Optional):
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {targets.map((t) => {
            const active = t.id === selectedTargetId;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTarget(t)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: active ? '1px solid #38bdf8' : '1px solid #1e293b',
                  backgroundColor: active ? 'rgba(56, 189, 248, 0.15)' : '#070b14',
                  color: active ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinate & Live Observation Search Form (Free Numerical User Entry) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '8px',
        alignItems: 'end',
      }}>
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '3px' }}>RA (deg)</label>
          <input
            type="text"
            value={ra}
            onChange={(e) => onChangeRa(e.target.value)}
            placeholder="e.g. 133.785"
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '3px' }}>Dec (deg)</label>
          <input
            type="text"
            value={dec}
            onChange={(e) => onChangeDec(e.target.value)}
            placeholder="e.g. -7.244"
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '3px' }}>Radius / FOV (°)</label>
          <input
            type="text"
            value={radius}
            onChange={(e) => onChangeRadius(e.target.value)}
            placeholder="e.g. 0.05"
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '3px' }}>No. of Pictures</label>
          <input
            type="number"
            min="2"
            max="12"
            value={maxResults}
            onChange={(e) => onChangeMaxResults(e.target.value)}
            placeholder="e.g. 6"
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '3px' }}>Start Date (opt)</label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '10px', marginBottom: '3px' }}>End Date (opt)</label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <button
            onClick={onQuery}
            disabled={isQuerying}
            style={{
              width: '100%',
              padding: '7px 14px',
              backgroundColor: '#0284c7',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: 'none',
              cursor: isQuerying ? 'not-allowed' : 'pointer',
              opacity: isQuerying ? 0.6 : 1,
            }}
          >
            {isQuerying ? 'Fetching...' : '🔍 Fetch SPHEREx FITS'}
          </button>
        </div>
      </div>
    </div>
  );
};
