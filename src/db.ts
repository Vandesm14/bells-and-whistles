import { ld } from 'https://deno.land/x/deno_lodash/mod.ts';

const splitPath = (path: string) => path.split(/[,./]/g);
const pathToRef = (obj: Store, path: string) =>
  splitPath(path).reduce((obj, part) => {
    return obj[part];
  }, obj);

const crawl = (obj: Store, fn?: (key: string, value: any) => void): Store => {
  const paths: Store = {};
  const queue = Object.keys(obj);
  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) throw new Error('Could not find a path');
    const ref = pathToRef(obj, path);
    paths[path] = ref;
    if (typeof ref === 'object' && !Array.isArray(ref))
      queue.push(...Object.keys(ref).map((el) => `${path}/${el}`));
  }

  return paths;
};

type Store = Record<string, any>;
type Reducer = (data: Store) => Store;

export const db = (init?: Store) => {
  let data = structuredClone(init) ?? {};
  const stamps: Map<string, Date> = new Map(
    Object.entries(crawl(data)).map(([key]) => [key, new Date()])
  );

  /** A pure transaction: Finds all of the changed values and updates the respective timestamps */
  const pure = (fn: Reducer) => {
    const newState = fn(structuredClone(data));
    const flat = crawl(newState);
    const flatData = crawl(data);

    const added: Map<string, any> = new Map(
      ld.differenceWith(
        Object.entries(flat),
        Object.entries(flatData),
        ld.isEqual
      )
    );
    const removed: Map<string, any> = new Map(
      ld.differenceWith(
        Object.entries(flatData),
        Object.entries(flat),
        ld.isEqual
      )
    );

    Array.from(added).forEach(([path]) => {
      stamps.set(path, new Date());

      // Removed will also include extra records until we remove them
      removed.delete(path);
    });
    Array.from(removed).forEach(([path]) => stamps.delete(path));

    data = newState;
    return db;
  };

  return {
    pure,
    stamps,
    get data() {
      return data;
    },
  };
};
