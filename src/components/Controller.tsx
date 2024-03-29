import React from 'react';
import { FRAME_RATE } from '../lib/engine';

interface DebuggerProps {
  isRecording: boolean;
  isPaused: boolean;
  index: number;
  length: number;
  onStepForward: () => void;
  onStepBackward: () => void;
  onToggleRecording: () => void;
  onTogglePaused: () => void;
  onChangeStep: (step: number) => void;
  onChangeIndex: (index: number) => void;
  size: number;
}

export default function Debugger({
  isRecording,
  isPaused,
  index,
  length,
  onStepForward,
  onStepBackward,
  onToggleRecording,
  onTogglePaused,
  onChangeStep,
  onChangeIndex,
  size,
}: DebuggerProps) {
  const [step, setStep] = React.useState(index);

  const handleStepChange = (step: number) => {
    setStep(Number(step));
    onChangeStep(Number(step));
  };

  // const stepWillExceedLength = step + index > length && step !== 1;

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
        </p>
      </div>
      <div>
        <button onClick={onStepBackward} disabled={index === 0}>
          Step Backward
        </button>
        <button onClick={onTogglePaused}>{isPaused ? 'Play' : 'Pause'}</button>
        <button onClick={onStepForward}>Step Forward</button>
        <label>
          <select
            onChange={(e) => handleStepChange(Number(e.target.value))}
            value={step}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={FRAME_RATE}>1s</option>
            <option value={FRAME_RATE * 2}>2s</option>
            <option value={FRAME_RATE * 5}>5s</option>
            <option value={FRAME_RATE * 10}>10s</option>
          </select>
        </label>
      </div>
      <input
        type="range"
        min={0}
        max={length}
        value={index}
        step={step}
        onChange={(e) => {
          onChangeIndex(Number(e.target.value));
        }}
      />
    </div>
  );
}
