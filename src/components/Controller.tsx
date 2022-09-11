import React from 'react';
import { FRAME_RATE } from '../lib/engine';

interface DebuggerProps {
  isRecording: boolean;
  isDebugging: boolean;
  isPaused: boolean;
  index: number;
  length: number;
  onStepForward: () => void;
  onStepBackward: () => void;
  onToggleRecording: () => void;
  onToggleDebugging: () => void;
  onTogglePaused: () => void;
  onChangeStep: (step: number) => void;
  size: number;
}

export default function Debugger({
  isRecording,
  isDebugging,
  isPaused,
  index,
  length,
  onStepForward,
  onStepBackward,
  onToggleRecording,
  onToggleDebugging,
  onTogglePaused,
  onChangeStep,
  size,
}: DebuggerProps) {
  const [step, setStep] = React.useState(index);

  const handleStepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStep(Number(e.target.value));
    onChangeStep(Number(e.target.value));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 'max-content',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 'max-content',
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={isDebugging}
            onChange={onToggleDebugging}
          />
          Debug
        </label>
        <label>
          <input
            type="checkbox"
            checked={isRecording}
            onChange={onToggleRecording}
          />
          Record to History
        </label>
        <p>
          History size: {(size / 1024).toFixed(2)} KB
          <br />
          Currnet step: {index} of {length}
          <br />
          Time: {(index / FRAME_RATE).toFixed(2)}s of{' '}
          {(length / FRAME_RATE).toFixed(2)}s
          <br />
          {step + index > length && step !== 1 ? (
            <span style={{ color: 'red' }}>
              Warning: Next step will exceed history length
            </span>
          ) : null}
        </p>
      </div>
      <div>
        <button onClick={onStepBackward} disabled={index === 0}>
          Step Backward
        </button>
        <button onClick={onTogglePaused}>{isPaused ? 'Play' : 'Pause'}</button>
        <button onClick={onStepForward}>Step Forward</button>
        <label>
          <select onChange={handleStepChange}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value={FRAME_RATE}>1s</option>
            <option value={FRAME_RATE * 2}>2s</option>
            <option value={FRAME_RATE * 5}>5s</option>
            <option value={FRAME_RATE * 10}>10s</option>
          </select>
        </label>
      </div>
    </div>
  );
}
