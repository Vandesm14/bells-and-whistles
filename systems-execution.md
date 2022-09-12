# Systems

- fuel
  - avail
    - r: `fuel.pump`, `fuel.tank`
    - w: `fuel.avail`
  - tank
    - r: `engine.N2.value`, `engine.fuelValve`, `fuel.avail`, `fuel.tank`
    - w: `fuel.tank`, `fuel.usage`
- engine
  - starter
    - r: `engine.N2.value`, `engine.input.starter`
    - w: `engine.startValve`, `engine.targetN2.starter`
  - throttle
    - r: `fuel.avail`, `engine.fuelValve`, `engine.N2.value`, `input.throttle`
    - w: `engine.targetN2.throttle`
  - N2Total
    - r: `engine.targetN2.starter`, `engine.targetN2.throttle`, `engine.targetN2.total`
    - w: `engine.targetN2.total`
  - N2RetrigInterp
    - r: `engine.targetN2.didChange`, `engine.N2`, `engine.N2.value`, `engine.targetN2.total.value`
    - w: `engine.N2`
  - N2UpdateInterp
    - r: `engine.targetN2.total.value`, `engine.N2`, `engine.targetN2.throttle`, `engine.N2.value`
    - w: `engine.N2`

## Execution Order

Ideally, we can run all systems in parallel and leave it at that. However, it's difficult to avoid having dependencies, even if functions are atomic (only accomplishing one task). The atomic nature allows us to rearrange them easier, hopefully adding many complex optimizations in the future in ever-changing simulations.

Because we have dependencies, the first big challenge of this parallel execution feature is to know which systems cannot be run in parallel, and must be run in series.

## Dependency Graph

Steps to accomplish this:

1. Identify all of the paths that are being written to
2. For each path, identify all systems that read from it (either a specific value or the entire path)
3. Recurse through this until we run out of systems or we reach a depth equal to the amount of systems
