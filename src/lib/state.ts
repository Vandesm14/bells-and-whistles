export type Store = Record<string, any>;

function last<T>(arr: Array<T>): T {
  return arr[arr.length - 1];
}

interface KV {
  get(key?: string): Store;
  set(key: string, value: any): KV;
  bulkSet(arr: Array<[string, any]>): KV;
  delete(key: string): KV;
}

export function KV(init?: Store): KV {
  let _store = structuredClone(init || {});
  return {
    get(key?: string): any | Store {
      if (!key) {
        return _store;
      } else {
        const keys = key.split('/');
        let value = _store;

        for (const key of keys) {
          value = value[key];
        }

        return value;
      }
    },
    set(key: string, value: any) {
      const keys = key.split('/');
      let store = _store;
      for (const key of keys.slice(0, -1)) {
        if (!store[key]) {
          store[key] = {};
        }

        store = store[key];
      }

      store[last(keys)] = value;
      return this;
    },
    bulkSet(obj: Array<[string, any]>) {
      for (const [key, value] of obj) {
        this.set(key, value);
      }
      return this;
    },
    delete(key: string) {
      const keys = key.split('/');
      let store = _store;
      for (const key of keys.slice(0, -1)) {
        store = store[key];
      }

      delete store[last(keys)];
      return this;
    },
  };
}
