import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/input/Slider';
import { Switch } from './components/input/Switch';
import EngineMfd from './components/EngineMfd';
import { initDebugState } from './lib/engine';
import { initial, World, constants, fuelIsAvail } from './lib/world';
import { applyPartialDiff } from './lib/util';
import Controller from './components/Controller';
import * as history from './lib/history';
import colors from './components/compose/colors';
import { Column } from './components/compose/flex';
import { useStore } from './lib/store';

const App = () => {
  const store = useStore();

  const { setStore } = store;

  useEffect(store.start, []);

  const setWorld = (world: World) =>
    setStore((state) => applyPartialDiff(state, { world }));
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
                setStore((state) =>
                  applyPartialDiff(state, { debug: { step } })
                )
              }
              onChangeIndex={store.stepTo}
              size={JSON.stringify(readDebug.history).length}
            />
            <button
              onClick={() => {
                setStore((state) =>
                  applyPartialDiff(state, {
                    debug: {
                      history: history.generate(state.world),
                      recording: false,
                    },
                  })
                );
              }}
            >
              Reset Debugger
            </button>
            <button
              onClick={() => {
                // TODO: we don't stop or start the sim when resetting (I'm not sure if this is the right behavior)
                setStore((state) =>
                  applyPartialDiff(state, {
                    world: initial,
                    debug: {
                      ...initDebugState(initial),
                      paused: state.debug.paused,
                    },
                  })
                );
              }}
            >
              Reset ALL
            </button>
            <pre>{JSON.stringify(store.debug, null, 2)}</pre>
          </>
        ) : null}
      </Column>
      <Column maxContent align="right">
        <Column maxContent center>
          <Switch
            label="fuel pump"
            value={!readWorld.fuel.pump}
            onChange={(pump) =>
              setWorld(applyPartialDiff(readWorld, { fuel: { pump: !pump } }))
            }
          />
          <Switch
            label="starter"
            value={readWorld.engine.input.starter}
            top={{
              on:
                readWorld.engine.N2.value < constants.engine.N2_START &&
                !readWorld.engine.startValve,
              text: 'avail',
              color: 'green',
            }}
            bottom={{
              on: readWorld.engine.input.starter,
              text: 'on',
              color: 'white',
            }}
            onChange={(starter) =>
              setWorld(
                applyPartialDiff(readWorld, {
                  engine: { input: { starter: starter } },
                })
              )
            }
          />
          <Switch
            label="fuel valve"
            top={{
              text: 'avail',
              color: colors.status.green,
              on:
                fuelIsAvail(readWorld) &&
                readWorld.engine.N2.value >= constants.engine.N2_START &&
                !readWorld.engine.fuelValve,
            }}
            value={!readWorld.engine.fuelValve}
            onChange={(fuelValve) =>
              setWorld(
                applyPartialDiff(readWorld, {
                  engine: { fuelValve: !fuelValve },
                })
              )
            }
          />
          <Slider
            path="input.throttle"
            state={readWorld}
            setState={setWorld}
            label="throttle"
          />
        </Column>
        <EngineMfd
          N2={readWorld.engine.N2.value}
          throttle={readWorld.input.throttle}
        />
      </Column>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
