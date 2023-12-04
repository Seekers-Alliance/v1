import { create } from 'zustand';
import { Md5 } from 'ts-md5';

type DrawingPoolStore = {
  pools: {
    list: string[];
    map: Map<string, PoolProbabilities>;
  };
  add: (pool: PoolProbabilities) => void;
  remove: (pool: PoolProbabilities) => void;
  getPool: (name: string) => PoolProbabilities | undefined;
};

interface PoolProbabilities {
  id: string;
  name: string;
  probabilities: number[];
}

export const useDrawingPoolStore = create<DrawingPoolStore>((set, get) => ({
  pools: {
    list: [],
    map: new Map(),
  },
  add: (pool: PoolProbabilities) =>
    set((state) => {
      if (!state.pools.list.includes(pool.name)) {
        state.pools.list.push(pool.name);
      }
      state.pools.map.set(Md5.hashStr(pool.name), pool);
      return state;
    }),
  remove: (pool: PoolProbabilities) => {
    set((state) => {
      state.pools.list = state.pools.list.filter((i) => i !== pool.name);
      state.pools.map.delete(Md5.hashStr(pool.name));
      return state;
    });
  },
  getPool: (name: string) => {
    return get().pools.map.get(Md5.hashStr(name));
  },
}));
