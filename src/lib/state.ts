export type Store = Record<string, any>;

function last<T>(arr: Array<T>): T {
  return arr[arr.length - 1];
}

export class KV {
  private store: Store = {};

  get(key?: string): any {
    if (!key) {
      return this.store;
    } else {
      const keys = key.split('/');
      let value = this.store;

      for (const key of keys) {
        value = value[key];
      }

      return value;
    }
  }

  set(key: string, value: any): void {
    const keys = key.split('/');
    let store = this.store;

    for (const key of keys.slice(0, -1)) {
      if (!store[key]) {
        store[key] = {};
      }

      store = store[key];
    }

    store[last(keys)] = value;
  }

  delete(key: string): void {
    const keys = key.split('/');
    let store = this.store;

    for (const key of keys.slice(0, -1)) {
      store = store[key];
    }

    delete store[last(keys)];
  }
}
