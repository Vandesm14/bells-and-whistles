# Problems

## Organization of Systems

It would be great to just run everything in parallel, but the real world doesn't work that way. Systems will most likely have dependencies, parts of the state that it needs ready before it runs. Other systems might interact with the state before the system is run, and the state might be changed by other systems. This means that we need to have some way of organizing the systems so that they run in the correct order.

However, ordering isn't great. Ideally, we'd want to run as much as we can in parallel (this is a process-intensive game after all).

### Dependencies

Each system will be structured like so:

```ts
const systems = {
  startEngine: {
    deps: {
      read: ['engine', 'power', 'fuel.amount'],
      write: ['engine.running'],
    },
    run: (state) => {
      // ...
    },
  },
  doesntMatter: {
    run: (state) => {
      // ... this can be run whenever
    },
  },
};
```

This structure allows systems to declare what they need to run, and what they will change. This allows us to build a dependency graph of the systems, and run them in the correct order. This is a great start to organization, but it doesn't help us with **ordering**.

### Ordering

We need a way to order these systems. I might try out either:

- An `group` property that, if set, will group systems of the same order together and run them in parallel
  - If `group` is positive, it will run after all systems with a lower `group` value (and after the main group)
  - If `group` is negative, it will run before the systems without a group
  - If `group` is not set, it will run in the main group
