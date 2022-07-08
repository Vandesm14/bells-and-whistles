import { ld } from 'https://deno.land/x/deno_lodash/mod.ts';

const splitPath = (path: string) => path.split(/[,./]/g);
const pathToRef = (obj: Record<string, any>, path: string) =>
  splitPath(path).reduce((obj, part) => {
    return obj[part];
  }, obj);

const crawl = (
  obj: Record<string, any>,
  fn?: (key: string, value: any) => void
): Record<string, any> => {
  const paths: Record<string, any> = {};
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

const object = {
  home: {
    config: {
      a: 2,
    },
    b: 3,
  },
  c: 4,
};

const db = (init?: Record<string, any>) => {
  let data = init ?? {};
  const stamps: Map<string, Date> = new Map(
    Object.entries(crawl(data)).map(([key]) => [key, new Date()])
  );

  /** A pure transaction: Finds all of the changed values and updates the respective timestamps of modification */
  const pure = (newState: Record<string, any>) => {
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

    console.log({ added, removed });

    Array.from(added).forEach(([path]) => {
      stamps.set(path, new Date());

      // Removed will also include extra records until we remove them
      removed.delete(path);
    });
    Array.from(removed).forEach(([path]) => stamps.delete(path));

    console.log({ data, stamps });

    data = newState;
  };

  return {
    pure,
    stamps,
    data,
  };
};

const { pure, stamps, data } = db({ a: 2, c: 3, d: 4 });

setTimeout(() => pure({ a: 1, b: 2, c: 3 }), 500);
