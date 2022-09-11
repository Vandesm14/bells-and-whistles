# Resources

## Interfaces

- [buttons](https://www.opencockpits.com/catalog/korrys-overhead-a320-pi-360.html?image=6)

## Engines

### Engine Start Diagrams

- https://www.flight-mechanic.com/wp-content/uploads/2017/03/5-14.jpg
- https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEI6e6oDulHLLAkMbvNXcqJBDU6hX6cswoOg&usqp=CAU

### Display Behavior

- https://europe.content.twixlmedia.com/twixl-preview/e37527c12cbd8fc4effad5ac269b712b/content/bd6e86f32db9acd9d0fe4c2f763e36a2/18/images/fig.6%20-%20EWD%20takeoff.png?r=0.20562776366511382

### Engine Start

- https://www.youtube.com/watch?v=0OgEbs3ovOw

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
