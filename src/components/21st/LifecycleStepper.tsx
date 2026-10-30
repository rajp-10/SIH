/**
 * 21st.dev Component: Stepper / Lifecycle Stepper
 * @author @originui (Origin UI)
 * @source https://21st.dev/@originui/components/stepper
 * @adapted For FDR Guardian multi-step forms and end-to-end lifecycle visualizations
 */

import React from 'react';
import { Check, Circle, AlertTriangle, Clock3, ArrowRight } from 'lucide-react';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
  status?: 'complete' | 'current' | 'upcoming' | 'error';
}

export interface LifecycleStepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  interactive?: boolean;
}

export function LifecycleStepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  interactive = true
}: LifecycleStepperProps) {
  if (orientation === 'vertical') {
    return (
      <div className="lifecycle-stepper-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStep;
          const isComplete = idx < currentStep || step.status === 'complete';
          const isError = step.status === 'error';
          const isClickable = interactive && onStepClick && (isComplete || isCurrent);

          return (
            <div
              key={step.id}
              onClick={() => isClickable && onStepClick(idx)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: idx > currentStep && !isComplete ? 0.65 : 1
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    background: isError
                      ? 'var(--color-danger)'
                      : isComplete
                      ? 'var(--color-success)'
                      : isCurrent
                      ? 'var(--color-primary)'
                      : 'var(--color-secondary)',
                    color: isComplete || isCurrent || isError ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 'var(--text-xs)',
                    boxShadow: isCurrent ? '0 0 0 3px var(--color-primary-subtle)' : 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {isError ? (
                    <AlertTriangle size={15} />
                  ) : isComplete ? (
                    <Check size={15} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      width: '2px',
                      height: '32px',
                      background: isComplete ? 'var(--color-success)' : 'var(--color-border)',
                      margin: '4px 0'
                    }}
                  />
                )}
              </div>
              <div style={{ paddingTop: '4px' }}>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? 'var(--color-primary)' : 'var(--color-text)'
                  }}
                >
                  {step.title}
                </div>
                {step.description && (
                  <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Stepper
  return (
    <div
      className="lifecycle-stepper-horizontal"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px 0 20px',
        overflowX: 'auto'
      }}
    >
      {steps.map((step, idx) => {
        const isCurrent = idx === currentStep;
        const isComplete = idx < currentStep || step.status === 'complete';
        const isError = step.status === 'error';
        const isClickable = interactive && onStepClick && (isComplete || isCurrent);

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => isClickable && onStepClick(idx)}
              disabled={!isClickable}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: idx > currentStep && !isComplete ? 0.6 : 1,
                textAlign: 'left'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: isError
                    ? 'var(--color-danger)'
                    : isComplete
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-secondary)',
                  color: isComplete || isCurrent || isError ? '#FFFFFF' : 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 'var(--text-xs)',
                  boxShadow: isCurrent ? '0 0 0 3px var(--color-primary-subtle)' : 'none',
                  flexShrink: 0
                }}
              >
                {isError ? (
                  <AlertTriangle size={15} />
                ) : isComplete ? (
                  <Check size={15} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <div style={{ display: 'none', md: 'block' } as any}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-xs)',
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? 'var(--color-primary)' : 'var(--color-text)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {step.title}
                </span>
                {step.description && (
                  <small style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                    {step.description}
                  </small>
                )}
              </div>
            </button>
            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: isComplete ? 'var(--color-success)' : 'var(--color-border)',
                  margin: '0 8px',
                  minWidth: '24px'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
export default LifecycleStepper;
