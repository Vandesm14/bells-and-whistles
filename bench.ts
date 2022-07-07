import { ld } from 'https://deno.land/x/deno_lodash/mod.ts';
const uuid = (): string => crypto.randomUUID().split('-')[0];

const random = (from: number, to: number) =>
  Math.floor(Math.random() * to) + from;
const loop = <T>(fn: (item: T, i: number, arr: T[]) => T, n: number) =>
  Array(n).fill(0).map(fn);

const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

interface Entity {
  x: number;
  y: number;
  z: number;
  components: Record<string, any>;
  id: string;
}

const newObj = (names: string[]) => ({
  x: Math.random(),
  y: Math.random(),
  z: Math.random(),
  components: (() => {
    const obj: Entity['components'] = {};
    names.map((name) => (obj[name] = Math.random()));
    return obj;
  })(),
  id: uuid(),
});
const randomObjects = (n: number) =>
  loop(
    () =>
      newObj(loop<string>(() => names[random(0, names.length)], random(0, 10))),
    n
  );

const includes = <T>(arr: T[], has: T[]) =>
  has.every((item) => arr.includes(item));

const list: Entity[] = randomObjects(10_000);

// id -> Entity
const idIndex = (() => {
  const map: Map<string, Entity> = new Map();
  list.forEach((item) => map.set(item.id, item));
  return map;
})();

// component -> Entity['id']
const index = (() => {
  const map: Map<string, string[]> = new Map();
  names.forEach((name) =>
    map.set(
      name,
      list
        .filter((item) => Object.keys(item.components).includes(name))
        .map((item) => item.id)
    )
  );
  return map;
})();

const queries: string[][] = loop<string[]>(
  () => loop<string>(() => names[random(0, names.length)], random(0, 5)),
  10
);

Deno.bench('array.filter', () => {
  const results: Entity[][] = [];
  queries.forEach((query) => {
    results.push(
      list.filter((item) => includes(Object.keys(item.components), query))
    );
  });
});

Deno.bench('index + idIndex', () => {
  // const results: Item[] = queries
  //   .map(
  //     (query) =>
  //       query
  //         .map((el) => index.get(el))
  //         .flat()
  //         .filter(Boolean) as string[]
  //   )
  //   .reduce((arr, current) => ld.intersection(arr, current), [])
  //   .map((id) => idIndex.get(id))
  //   .filter(Boolean) as Item[];

  const results: Entity[][] = [];
  queries.forEach((query) => {
    const entities: Entity[] = [];
    // map of ids and the amount of times they come up (for comparison)
    const ids: Map<string, number> = new Map();
    // adds ids to the map and increments the count
    const add = (item: string) => {
      if (ids.has(item)) ids.set(item, ids.get(item)! + 1);
      else ids.set(item, 1);
    };
    // takes the ids in the query and adds each value from the index into the ids map
    query.forEach((id) => {
      const coll = index.get(id);
      if (coll) coll.map(add);
    });
    // if a query asks for entities with both components "a" and "b",
    // the index will contain all ids for each, which we need the intersection of
    //
    // the index has a list of all entities with each component, so it acts as a OR instead of an AND
    // in order to perform an AND, we only include entities that appear in BOTH lists "a" and "b",
    // an intersection and therefore an AND against both
    Array.from(ids).forEach(([id, n]) =>
      n === query.length ? entities.push(idIndex.get(id)!) : null
    );
    results.push(entities);
  });
});
