/**
 * 21st.dev Component: Slide / Hold to Confirm
 * @author @dorianbaffier (Kokonut UI)
 * @source https://21st.dev/@kokonutd/components/slide-to-confirm
 * @adapted For high-assurance regulatory decisions in FDR Guardian
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check, ShieldCheck, AlertTriangle } from 'lucide-react';

export interface SlideToConfirmProps {
  label: string;
  confirmedLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'success';
}

export function SlideToConfirm({
  label,
  confirmedLabel = 'Confirmed',
  onConfirm,
  disabled = false,
  variant = 'primary'
}: SlideToConfirmProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const getTrackColor = () => {
    switch (variant) {
      case 'danger':
        return 'var(--color-danger)';
      case 'success':
        return 'var(--color-success)';
      default:
        return 'var(--color-primary)';
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || confirmed) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !trackRef.current || confirmed) return;
    const rect = trackRef.current.getBoundingClientRect();
    const maxDrag = rect.width - 44; // handle width = 40px + 4px padding
    const currentX = e.clientX - rect.left - 20;
    const currentProgress = Math.min(1, Math.max(0, currentX / maxDrag));
    setProgress(currentProgress);

    if (currentProgress >= 0.96) {
      setConfirmed(true);
      setIsDragging(false);
      setProgress(1);
      onConfirm();
    }
  };

  const handlePointerUp = () => {
    if (confirmed) return;
    setIsDragging(false);
    setProgress(0);
  };

  return (
    <div
      ref={trackRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        height: '46px',
        background: 'var(--color-secondary)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
        opacity: disabled ? 0.6 : 1,
        border: '1px solid var(--color-border)'
      }}
    >
      {/* Fill progress */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress * 100}%`,
          background: getTrackColor(),
          opacity: 0.15,
          transition: isDragging ? 'none' : 'width 240ms ease'
        }}
      />

      {/* Text label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: confirmed ? getTrackColor() : 'var(--color-text)',
          pointerEvents: 'none'
        }}
      >
        {confirmed ? confirmedLabel : label}
      </div>

      {/* Draggable thumb / handle */}
      <div
        onPointerDown={handlePointerDown}
        style={{
          position: 'absolute',
          top: '3px',
          left: `${progress * (trackRef.current ? trackRef.current.clientWidth - 46 : 0) + 3}px`,
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-full)',
          background: getTrackColor(),
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'grab',
          boxShadow: 'var(--shadow-sm)',
          transition: isDragging ? 'none' : 'left 240ms ease'
        }}
      >
        {confirmed ? <Check size={18} /> : <ChevronRight size={18} />}
      </div>
    </div>
  );
}
export default SlideToConfirm;
