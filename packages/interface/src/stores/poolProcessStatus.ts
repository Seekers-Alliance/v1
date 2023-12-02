import { create } from 'zustand';
import { PoolProcessStatus } from '@/types';

type PoolProcessStatusStore = {
  status: PoolProcessStatus;
  updateStatus: (status: PoolProcessStatus) => void;
};

export const usePoolProcessStatusStore = create<PoolProcessStatusStore>(
  (set) => ({
    status: PoolProcessStatus.SelectNFT,
    updateStatus: (status: PoolProcessStatus) =>
      set((state) => ({ status: status })),
  })
);
