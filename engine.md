# Engine

## On Start

- [switch] external power `ON`
- [switch] fuel pump `ON`
- [switch] external bleed air `ON`
- [switch] starter `ON`
- [note] starter switch is locked until start is complete
- [state] starter valve is opened
- [state] N2 spins up to 25%
- [state] N1 spins up to 5%
- [switch] fuel valve `IDLE`
<!-- - [state] engine shutoff valve is opened (this is from the video, but won't be used right now) -->
- [state] igniter `ON`
- [note] fuel ignites
- [state] N2 spins up to 56%
- [state] N1 spins up to 15%
- [state] EGT rises to 41.0% <!-- TODO: need unit -->
- [state] starter switch is unlocked and is set to `OFF`
- [state] starter valve is closed
- [state] igniter `OFF`
- [state] N2 spins up to 60%
- [state] N1 spins up to 20%
- [state] EGT rises to 45.0%

## On Throttle

- [slider] throttle `IDLE`
- [slider] throttle `TOGA`
- [state] fuel flow rate is increased past idle
- [state] N2 spins up to 100%
- [state] N1 spins up to 100%
- [state] EGT rises to 100.0%

## On Shutdown

- [switch] fuel valve `CUT`
- [state] fuel flow stops
- [state] N2 spins down to 0%
- [state] N1 spins down to 0%
- [state] EGT drops to 0.0%
