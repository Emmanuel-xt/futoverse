// hooks/useImageModal.js
import { create } from "zustand";

const useImageModal = create((set) => ({
  imageUrl: null,
  isOpen: false,
  openModal: (url) => set({ imageUrl: url, isOpen: true }),
  closeModal: () => set({ imageUrl: null, isOpen: false }),
}));

export default useImageModal;
