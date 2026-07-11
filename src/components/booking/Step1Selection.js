"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bed,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

const ROOMS_API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/rooms";
const AVAILABILITY_API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/bookings/availability";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542314831-c6a4d14ecc8a?q=80&w=1600&auto=format&fit=crop";

const PLACEHOLDER_ROOMS = [
  {
    id: "deluxe-ocean",
    name: "Deluxe Ocean Suite",
    description:
      "Panoramic ocean views, marble bath, and a private balcony curated for golden-hour rituals.",
    price: 85000,
    size: "68 m²",
    bed: "King",
    image: FALLBACK_IMAGE,
    availableRooms: 3,
    isAvailable: true,
  },
  {
    id: "presidential",
    name: "Presidential Residence",
    description:
      "A two-level sanctuary with butler service, dining salon, and bespoke interior artistry.",
    price: 185000,
    size: "142 m²",
    bed: "Emperor King",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a784e15d58?q=80&w=1600&auto=format&fit=crop",
    availableRooms: 2,
    isAvailable: true,
  },
  {
    id: "garden-villa",
    name: "Garden Villa",
    description:
      "Secluded tropical gardens, plunge pool, and an open-air pavilion for private dining.",
    price: 125000,
    size: "96 m²",
    bed: "King + Daybed",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop",
    availableRooms: 4,
    isAvailable: true,
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors [color-scheme:dark] placeholder:text-white/35 focus:border-amber-400/70 will-change-transform";

const mapApiRoom = (room, availability = {}) => ({
  id: room._id || room.id,
  name: room.name,
  description: room.description,
  price: room.price,
  size: room.size || "Luxury suite",
  bed: room.bed || "Signature bed",
  image: room.images?.[0] || room.image || FALLBACK_IMAGE,
  availableRooms:
    availability.availableRooms ??
    room.availableRooms ??
    (room.isAvailable === false ? 0 : 1),
  isAvailable:
    availability.isAvailable ??
    room.isAvailable ??
    (availability.availableRooms ?? 1) > 0,
});

const getLocalToday = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

export default function Step1Selection() {
  const searchParamsFromUrl = useSearchParams();
  const searchParams = useBookingStore((state) => state.searchParams);
  const selectedRooms = useBookingStore((state) => state.selectedRooms);
  const updateSearchParams = useBookingStore(
    (state) => state.updateSearchParams,
  );
  const updateRoomQuantity = useBookingStore(
    (state) => state.updateRoomQuantity,
  );
  const getRoomQuantity = useBookingStore((state) => state.getRoomQuantity);
  const getTotalSelectedRooms = useBookingStore(
    (state) => state.getTotalSelectedRooms,
  );
  const syncRoomAvailability = useBookingStore(
    (state) => state.syncRoomAvailability,
  );
  const setStep = useBookingStore((state) => state.setStep);

  const [rooms, setRooms] = useState(PLACEHOLDER_ROOMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const hasAppliedUrlParams = useRef(false);
  const hasAppliedUrlRoom = useRef(false);

  const totalSelectedRooms = getTotalSelectedRooms();
  const minDate = getLocalToday();

  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      try {
        const response = await fetch(ROOMS_API_URL);
        const payload = await response.json().catch(() => null);

        if (!response.ok || !isMounted) {
          return;
        }

        const apiRooms = Array.isArray(payload?.data) ? payload.data : [];

        if (apiRooms.length > 0) {
          setRooms(apiRooms.map((room) => mapApiRoom(room)));
        }
      } catch {
        // Gracefully fall back to curated placeholder rooms.
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasAppliedUrlParams.current) {
      return;
    }

    const checkIn = searchParamsFromUrl.get("checkIn");
    const checkOut = searchParamsFromUrl.get("checkOut");
    const adults = searchParamsFromUrl.get("adults");
    const children = searchParamsFromUrl.get("children");
    const nextParams = {};

    if (checkIn) {
      nextParams.checkIn = checkIn;
    }

    if (checkOut) {
      nextParams.checkOut = checkOut;
    }

    if (adults && Number.isFinite(Number(adults))) {
      nextParams.adults = Math.max(1, Number(adults));
    }

    if (children && Number.isFinite(Number(children))) {
      nextParams.children = Math.max(0, Number(children));
    }

    if (Object.keys(nextParams).length > 0) {
      updateSearchParams(nextParams);
    }

    hasAppliedUrlParams.current = true;
  }, [searchParamsFromUrl, updateSearchParams]);

  useEffect(() => {
    let isMounted = true;

    const fetchAvailability = async () => {
      const checkIn = searchParams.checkIn;
      const checkOut = searchParams.checkOut;

      if (!checkIn || !checkOut) {
        setRooms((current) =>
          current.map((room) => ({
            ...room,
            availableRooms: room.availableRooms ?? 1,
            isAvailable: true,
          })),
        );
        return;
      }

      const checkInDate = new Date(`${checkIn}T12:00:00`);
      const checkOutDate = new Date(`${checkOut}T12:00:00`);

      if (
        Number.isNaN(checkInDate.getTime()) ||
        Number.isNaN(checkOutDate.getTime()) ||
        checkOutDate <= checkInDate
      ) {
        return;
      }

      setIsCheckingAvailability(true);

      try {
        const params = new URLSearchParams({ checkIn, checkOut });
        const response = await fetch(
          `${AVAILABILITY_API_URL}?${params.toString()}`,
        );
        const payload = await response.json().catch(() => null);

        if (!response.ok || !isMounted) {
          return;
        }

        const availabilityList = Array.isArray(payload?.data)
          ? payload.data
          : [];
        const availabilityMap = new Map(
          availabilityList.map((room) => [
            room._id,
            {
              availableRooms: room.availableRooms ?? 0,
              isAvailable: room.isAvailable ?? room.availableRooms > 0,
            },
          ]),
        );

        setRooms((current) =>
          current.map((room) => {
            const availability = availabilityMap.get(room.id);

            if (!availability) {
              return room;
            }

            return {
              ...room,
              availableRooms: availability.availableRooms,
              isAvailable: availability.isAvailable,
            };
          }),
        );

        syncRoomAvailability(
          new Map(
            availabilityList.map((room) => [
              room._id,
              room.availableRooms ?? 0,
            ]),
          ),
        );
      } catch {
        // Keep the previous room state if availability cannot be refreshed.
      } finally {
        if (isMounted) {
          setIsCheckingAvailability(false);
        }
      }
    };

    fetchAvailability();
  }, [searchParams.checkIn, searchParams.checkOut, syncRoomAvailability]);

  useEffect(() => {
    if (isLoading || hasAppliedUrlRoom.current) {
      return;
    }

    const roomId = searchParamsFromUrl.get("roomId");

    if (!roomId) {
      return;
    }

    const matchedRoom = rooms.find((room) => room.id === roomId);

    if (matchedRoom && matchedRoom.isAvailable !== false) {
      const maxAvailable = matchedRoom.availableRooms ?? 1;

      if (getRoomQuantity(matchedRoom.id) === 0) {
        updateRoomQuantity(matchedRoom, 1, maxAvailable);
      }
    }

    hasAppliedUrlRoom.current = true;
  }, [
    isLoading,
    rooms,
    searchParamsFromUrl,
    updateRoomQuantity,
    getRoomQuantity,
  ]);

  const guestSummary = useMemo(() => {
    const parts = [
      `${searchParams.adults} Adult${searchParams.adults !== 1 ? "s" : ""}`,
    ];

    if (searchParams.children > 0) {
      parts.push(
        `${searchParams.children} Child${searchParams.children !== 1 ? "ren" : ""}`,
      );
    }

    return parts.join(" · ");
  }, [searchParams.adults, searchParams.children]);

  const hasSelectedDates = Boolean(
    searchParams.checkIn && searchParams.checkOut,
  );

  const hasValidDates = useMemo(() => {
    if (!searchParams.checkIn || !searchParams.checkOut) {
      return false;
    }

    const checkInDate = new Date(`${searchParams.checkIn}T12:00:00`);
    const checkOutDate = new Date(`${searchParams.checkOut}T12:00:00`);

    return (
      !Number.isNaN(checkInDate.getTime()) &&
      !Number.isNaN(checkOutDate.getTime()) &&
      checkOutDate > checkInDate
    );
  }, [searchParams.checkIn, searchParams.checkOut]);

  const canContinue =
    totalSelectedRooms > 0 && hasValidDates && !isCheckingAvailability;

  const adjustGuests = (field, delta) => {
    const nextValue = searchParams[field] + delta;

    if (field === "adults" && nextValue < 1) {
      return;
    }

    if (field === "children" && nextValue < 0) {
      return;
    }

    updateSearchParams({ [field]: nextValue });
  };

  const handleQuantityChange = (room, delta) => {
    const currentQuantity = getRoomQuantity(room.id);
    const maxAvailable = room.availableRooms ?? 0;
    const nextQuantity = currentQuantity + delta;

    updateRoomQuantity(room, nextQuantity, maxAvailable);
  };

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    setStep(2);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="pb-28 will-change-transform"
      >
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
            Stage One
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Dates & Room Selection
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Select your dates, then curate a multi-room itinerary with real-time
            availability across our private collection.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                <CalendarDays size={14} className="text-amber-300" />
                Check-in
              </span>
              <input
                type="date"
                value={searchParams.checkIn}
                min={minDate}
                onChange={(event) =>
                  updateSearchParams({ checkIn: event.target.value })
                }
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                <CalendarDays size={14} className="text-amber-300" />
                Check-out
              </span>
              <input
                type="date"
                value={searchParams.checkOut}
                min={minDate}
                onChange={(event) =>
                  updateSearchParams({ checkOut: event.target.value })
                }
                className={inputClass}
              />
            </label>

            <div className="relative md:col-span-2 xl:col-span-1">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                <Users size={14} className="text-amber-300" />
                Guests
              </span>
              <button
                type="button"
                onClick={() => setShowGuestPicker((value) => !value)}
                className="flex w-full min-w-[220px] items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-left text-sm text-white transition-colors hover:border-amber-400/40 will-change-transform"
              >
                <span>{guestSummary}</span>
                {showGuestPicker ? (
                  <ChevronUp size={16} className="text-amber-300" />
                ) : (
                  <ChevronDown size={16} className="text-white/50" />
                )}
              </button>

              {showGuestPicker ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 z-20 mt-2 w-full min-w-[260px] rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl will-change-transform"
                >
                  {[
                    { key: "adults", label: "Adults", min: 1 },
                    { key: "children", label: "Children", min: 0 },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm text-white/80">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => adjustGuests(item.key, -1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm text-white">
                          {searchParams[item.key]}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustGuests(item.key, 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
                Available Rooms
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Curated Residences
              </h3>
            </div>
            <div className="hidden items-center gap-2 text-sm text-white/50 sm:flex">
              <Sparkles size={14} className="text-amber-300" />
              {hasValidDates
                ? isCheckingAvailability
                  ? "Checking availability..."
                  : `${rooms.filter((room) => (room.availableRooms ?? 0) > 0).length} residence types available`
                : `${rooms.length} curated residences`}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5"
                >
                  <div className="h-56 animate-pulse bg-white/8" />
                  <div className="space-y-4 p-6">
                    <div className="h-6 w-2/3 animate-pulse rounded-xl bg-white/8" />
                    <div className="h-16 w-full animate-pulse rounded-xl bg-white/8" />
                    <div className="h-10 w-1/2 animate-pulse rounded-full bg-white/8" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room, index) => {
                const quantity = getRoomQuantity(room.id);
                const availableRooms = room.availableRooms ?? 0;
                const isFullyBooked = availableRooms === 0;
                const isInCart = quantity > 0;

                return (
                  <motion.article
                    key={room.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className={`group relative overflow-hidden rounded-[1.75rem] border transition-all duration-300 will-change-transform ${
                      isFullyBooked
                        ? "border-white/8 bg-white/[0.02] opacity-55"
                        : isInCart
                          ? "border-amber-400/50 bg-amber-400/[0.06] shadow-[0_24px_70px_rgba(212,165,116,0.18)]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.name}
                        className={`h-full w-full object-cover transition-transform duration-700 ${
                          isFullyBooked
                            ? "grayscale-[40%]"
                            : "group-hover:scale-105"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    </div>

                    <div className="p-6">
                      <h4 className="text-xl font-semibold tracking-tight text-white">
                        {room.name}
                      </h4>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/65">
                        {room.description}
                      </p>

                      {/* Dynamic Inventory Highlight - Date Dependent */}
                      {hasSelectedDates ? (
                        availableRooms > 0 ? (
                          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-amber-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                            {availableRooms}{" "}
                            {availableRooms === 1 ? "Suite" : "Suites"}{" "}
                            Available
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-red-500/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Fully Booked
                          </div>
                        )
                      ) : (
                        <div className="mt-4 text-sm font-medium text-white/40">
                          Please select dates to view availability
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/55">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
                          <Maximize size={12} className="text-amber-300" />
                          {room.size}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
                          <Bed size={12} className="text-amber-300" />
                          {room.bed}
                        </span>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                            Nightly
                          </div>
                          <div className="mt-1 text-lg font-medium text-amber-200">
                            {formatPrice(room.price)}
                          </div>
                        </div>

                        {!isFullyBooked ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 p-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(room, -1)}
                              disabled={quantity <= 0}
                              aria-label={`Decrease ${room.name} quantity`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-semibold text-white">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(room, 1)}
                              disabled={quantity >= availableRooms}
                              aria-label={`Increase ${room.name} quantity`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {totalSelectedRooms > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-[#050607]/90 px-4 py-4 backdrop-blur-xl sm:px-6"
          >
            <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3 text-center text-sm text-white/75 sm:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-200">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                    Your Selection
                  </p>
                  <p className="font-medium text-white">
                    {totalSelectedRooms} room
                    {totalSelectedRooms !== 1 ? "s" : ""} selected
                    {selectedRooms.length > 1
                      ? ` across ${selectedRooms.length} residence types`
                      : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue}
                className="lux-action inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] will-change-transform disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8 sm:py-3.5"
              >
                {isCheckingAvailability
                  ? "Checking Availability..."
                  : !hasValidDates
                    ? "Select Valid Dates"
                    : "Continue to Personalization"}
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
