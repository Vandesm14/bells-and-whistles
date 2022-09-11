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
}: DebuggerProps) {
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
          History entry {index} of {length}
        </p>
      </div>
      <div>
        <button onClick={onStepBackward}>Step Backward</button>
        {/* play/pause button below */}
        <button onClick={onTogglePaused}>{isPaused ? 'Play' : 'Pause'}</button>
        <button onClick={onStepForward}>Step Forward</button>
      </div>
    </div>
  );
}
