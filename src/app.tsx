import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Switch } from './components/input/Switch';
import { DebugState, initDebugState } from './lib/engine';
import { initial, queries, World } from './lib/world';
import { applyPartialDiff } from './lib/util';
import Controller from './components/Controller';
import * as history from './lib/history';
import { Column } from './components/compose/flex';
import { useStore } from './lib/store';
import LCD from './components/output/LCD';
import colors from './components/compose/colors';

const App = () => {
  const store = useStore();

  useEffect(store.start, []);

  const setWorld = (world: World) =>
    store.setStore((state) => applyPartialDiff(state, { world }));
  const setDebug = (debug: DebugState) =>
    store.setStore((state) => applyPartialDiff(state, { debug }));
  const { world: readWorld, debug: readDebug } = store;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <Column maxContent>
        <label>
          <input
            type="checkbox"
            checked={readDebug.debugging}
            onChange={() => store.toggleDebugging()}
          />
          Debug
        </label>
        {readDebug.debugging ? (
          <>
            <Controller
              isRecording={readDebug.recording}
              isPaused={readDebug.paused}
              index={readDebug.history.index}
              length={readDebug.history.list.length}
              onStepForward={store.stepForward}
              onStepBackward={store.stepBackward}
              onToggleRecording={store.toggleRecording}
              onTogglePaused={store.togglePaused}
              onChangeStep={(step) =>
                setDebug(applyPartialDiff(readDebug, { step }))
              }
              onChangeIndex={store.stepTo}
              size={JSON.stringify(readDebug.history).length}
            />
            <button
              onClick={() => {
                setDebug(
                  applyPartialDiff(readDebug, {
                    history: history.generate(readWorld),
                    recording: false,
                  })
                );
              }}
            >
              Reset Debugger
            </button>
            <button
              onClick={() => {
                // TODO: we don't stop or start the sim when resetting (I'm not sure if this is the right behavior)
                setWorld(initial);
                setDebug({
                  ...initDebugState(initial),
                  paused: readDebug.paused,
                });
              }}
            >
              Reset ALL
            </button>
            <pre>{JSON.stringify(store.world, null, 2)}</pre>
          </>
        ) : null}
      </Column>
      <Column maxContent align="right">
        <Switch
          label="Battery"
          bottom={{
            text: readWorld.input.battery ? 'on' : 'off',
          }}
          value={readWorld.input.battery}
          onChange={(battery) =>
            setWorld(applyPartialDiff(readWorld, { input: { battery } }))
          }
        />
        <Switch
          label="Reactor"
          bottom={{
            text: readWorld.input.reactor.master ? 'on' : 'off',
          }}
          value={readWorld.input.reactor.master}
          onChange={(master) =>
            setWorld(
              applyPartialDiff(readWorld, { input: { reactor: { master } } })
            )
          }
        />
        <LCD
          value={
            queries.reactor.canBePowered(readWorld)
              ? queries.reactor.state(readWorld)
              : ''
          }
          label="Active"
          ch={5}
          color={queries.reactor.stateColor(readWorld)}
        />
        <LCD
          value={Math.floor(readWorld.reactor.mwatts * 100)}
          label="Power"
          ch={4}
        />
      </Column>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
