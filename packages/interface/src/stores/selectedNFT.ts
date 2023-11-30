import { create } from 'zustand';

type SelectedNFTStore = {
  selectedNFTList: BigInt[];
  add: (id: BigInt) => void;
  addAll: (idList: BigInt[]) => void;
  remove: (id: BigInt) => void;
  removeAll: () => void;
};

export const useSelectedNFTStore = create<SelectedNFTStore>((set) => ({
  selectedNFTList: [],
  add: (id: BigInt) =>
    set((state) => ({ selectedNFTList: state.selectedNFTList.concat(id) })),
  addAll: (idList: BigInt[]) => set((state) => ({ selectedNFTList: idList })),
  remove: (id: BigInt) =>
    set((state) => ({
      selectedNFTList: state.selectedNFTList.filter((i) => i === id),
    })),
  removeAll: () => set({ selectedNFTList: [] }),
}));
