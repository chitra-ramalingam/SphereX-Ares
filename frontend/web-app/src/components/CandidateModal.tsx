import React from 'react';

interface CandidateReport {
  verdict: string;
  explanation: string;
  time_span_days?: number;
  displacement_arcsec?: number;
  displacement_pixels?: number;
  significance_sigma?: number;
  motion_arcsec_per_year?: number;
  motion_east_arcsec_per_year?: number;
  motion_north_arcsec_per_year?: number;
  position_angle_deg?: number;
  detected_frames: number;
  total_frames: number;
  text_report?: string;
  click: {
    x: number;
    y: number;
    ra: number;
    dec: number;
    frame: number;
  };
}

interface CandidateModalProps {
  report: CandidateReport | null;
  isLoading: boolean;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  report,
  isLoading,
  onClose,
}) => {
  if (!report && !isLoading) return null;

  const handleDownload = () => {
    if (!report?.text_report) return;
    const blob = new Blob([report.text_report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_astrometry_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: '#090d16',
        borderRadius: '8px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0c1322',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>🎯</span>
            <strong style={{ fontSize: '13px', color: '#fff', fontFamily: 'monospace' }}>
              Candidate Astrometry Investigation
            </strong>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', fontFamily: 'monospace' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#38bdf8' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
              Measuring flux-weighted centroids across all observation epochs...
            </div>
          ) : report ? (
            <>
              {/* Verdict Banner */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: (report.verdict || '').toLowerCase().includes('moving') ? 'rgba(225, 29, 72, 0.15)' : 'rgba(51, 65, 85, 0.4)',
                border: (report.verdict || '').toLowerCase().includes('moving') ? '1px solid #e11d48' : '1px solid #475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' }}>Verdict</span>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: (report.verdict || '').toLowerCase().includes('moving') ? '#fb7185' : '#e2e8f0',
                  }}>
                    {report.verdict || 'Astrometry Analysis Complete'}
                  </div>
                </div>
                {report.significance_sigma && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Significance</span>
                    <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>
                      {report.significance_sigma.toFixed(1)} σ
                    </div>
                  </div>
                )}
              </div>

              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.4' }}>
                {report.explanation}
              </p>

              {/* Numerical Metrics */}
              {report.motion_arcsec_per_year !== undefined && !isNaN(report.motion_arcsec_per_year) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: '#0c1322',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px' }}>Proper Motion</span>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>
                      {report.motion_arcsec_per_year.toFixed(2)} "/yr
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px' }}>Position Angle</span>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>
                      {report.position_angle_deg?.toFixed(1)}°
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px' }}>Time Baseline</span>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>
                      {report.time_span_days?.toFixed(0)} days
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10px' }}>Detections</span>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>
                      {report.detected_frames} / {report.total_frames} frames
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Astrometry Report Text Area */}
              <div>
                <span style={{ color: '#64748b', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
                  Astrometry Report Output:
                </span>
                <pre style={{
                  margin: 0,
                  padding: '10px',
                  backgroundColor: '#030712',
                  borderRadius: '4px',
                  border: '1px solid #1e293b',
                  fontSize: '10px',
                  color: '#94a3b8',
                  overflowX: 'auto',
                  maxHeight: '140px',
                }}>
                  {report.text_report}
                </pre>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          backgroundColor: '#0c1322',
        }}>
          {report?.text_report && (
            <button
              onClick={handleDownload}
              style={{
                padding: '6px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              💾 Save Report...
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              backgroundColor: '#06b6d4',
              border: 'none',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
