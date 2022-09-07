export type Store = Record<string, any>;

function last<T>(arr: Array<T>): T {
  return arr[arr.length - 1];
}

interface SetOptions {
  partial?: boolean;
}

export interface KV {
  get(key?: string): Store;
  set(key: string, value: any, opts?: SetOptions): KV;
  bulkSet(arr: Array<[string, any]>): KV;
  delete(key: string): KV;
}

export function KV(init?: Store): KV {
  const separators = /[./]/;
  let _store = structuredClone(init || {});
  return {
    get<T>(key?: string): T | Store {
      if (!key) {
        return _store;
      } else {
        const keys = key.split(separators);
        let value = _store;

        for (const key of keys) {
          value = value[key];
        }

        return value;
      }
    },
    set<T>(key: string, value: T, opts?: SetOptions): KV {
      const keys = key.split(separators);
      let store = _store;
      for (const key of keys.slice(0, -1)) {
        if (!store[key]) {
          store[key] = {};
        }

        store = store[key];
      }

      if (opts?.partial) {
        store[last(keys)] = { ...store[last(keys)], ...value };
      } else {
        store[last(keys)] = value;
      }
      return this;
    },
    bulkSet(obj: Array<[string, any]>) {
      for (const [key, value] of obj) {
        this.set(key, value);
      }
      return this;
    },
    delete(key: string) {
      const keys = key.split(separators);
      let store = _store;
      for (const key of keys.slice(0, -1)) {
        store = store[key];
      }

      delete store[last(keys)];
      return this;
    },
  };
}

/**
 * A mutable version of KV. All methods will mutate the store, but not the original object.
 */
export function KVMut(init?: Store): KV {
  let kv = KV(init);
  return {
    get<T>(key?: string): T | Store {
      return kv.get(key);
    },
    set<T>(key: string, value: T) {
      kv = kv.set(key, value);
      return this;
    },
    bulkSet(obj: Array<[string, any]>) {
      kv = kv.bulkSet(obj);
      return this;
    },
    delete(key: string) {
      kv = kv.delete(key);
      return this;
    },
  };
}
