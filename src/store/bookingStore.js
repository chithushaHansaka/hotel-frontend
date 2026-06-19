import { create } from "zustand";

const initialSearchParams = {
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
};

const initialGuestDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialRequests: "",
};

export const useBookingStore = create((set, get) => ({
  currentStep: 1,
  searchParams: { ...initialSearchParams },
  selectedRooms: [],
  selectedAddons: [],
  guestDetails: { ...initialGuestDetails },

  setStep: (step) =>
    set({
      currentStep: Math.min(3, Math.max(1, step)),
    }),

  updateSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  getRoomQuantity: (roomId) => {
    const entry = get().selectedRooms.find((item) => item.roomData.id === roomId);
    return entry?.quantity ?? 0;
  },

  getTotalSelectedRooms: () =>
    get().selectedRooms.reduce((sum, item) => sum + item.quantity, 0),

  updateRoomQuantity: (roomData, quantity, maxAvailable) =>
    set((state) => {
      const safeMax = Number.isFinite(maxAvailable)
        ? Math.max(0, maxAvailable)
        : Infinity;
      const safeQuantity = Math.min(Math.max(0, Number(quantity) || 0), safeMax);

      if (safeQuantity <= 0) {
        return {
          selectedRooms: state.selectedRooms.filter(
            (item) => item.roomData.id !== roomData.id,
          ),
        };
      }

      const existingIndex = state.selectedRooms.findIndex(
        (item) => item.roomData.id === roomData.id,
      );

      if (existingIndex >= 0) {
        const nextSelectedRooms = [...state.selectedRooms];
        nextSelectedRooms[existingIndex] = {
          roomData,
          quantity: safeQuantity,
        };

        return { selectedRooms: nextSelectedRooms };
      }

      return {
        selectedRooms: [...state.selectedRooms, { roomData, quantity: safeQuantity }],
      };
    }),

  syncRoomAvailability: (availabilityMap) =>
    set((state) => ({
      selectedRooms: state.selectedRooms
        .map((item) => {
          const availableRooms = availabilityMap.get(item.roomData.id);

          if (availableRooms === undefined) {
            return item;
          }

          if (availableRooms <= 0) {
            return null;
          }

          if (item.quantity > availableRooms) {
            return { ...item, quantity: availableRooms };
          }

          return item;
        })
        .filter(Boolean),
    })),

  toggleAddon: (addon) =>
    set((state) => {
      const exists = state.selectedAddons.some((item) => item.id === addon.id);

      if (exists) {
        return {
          selectedAddons: state.selectedAddons.filter(
            (item) => item.id !== addon.id,
          ),
        };
      }

      return {
        selectedAddons: [...state.selectedAddons, addon],
      };
    }),

  updateGuestDetails: (details) =>
    set((state) => ({
      guestDetails: { ...state.guestDetails, ...details },
    })),

  resetBooking: () =>
    set({
      currentStep: 1,
      searchParams: { ...initialSearchParams },
      selectedRooms: [],
      selectedAddons: [],
      guestDetails: { ...initialGuestDetails },
    }),
}));
