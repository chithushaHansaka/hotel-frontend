"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  Flower2,
  Mail,
  Phone,
  Sparkles,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/addons/active";

const PLACEHOLDER_ADDONS = [
  {
    id: "airport-transfer",
    name: "Airport Transfer",
    description:
      "Private chauffeur in a luxury sedan with chilled refreshments on arrival.",
    price: 18000,
    category: "Transport",
    icon: "car",
  },
  {
    id: "spa-ritual",
    name: "Signature Spa Ritual",
    description:
      "A 90-minute aromatherapy journey with bespoke botanical infusions.",
    price: 32000,
    category: "Wellness",
    icon: "spa",
  },
  {
    id: "private-dining",
    name: "Private In-Suite Dining",
    description:
      "Chef-curated tasting menu served in the intimacy of your residence.",
    price: 45000,
    category: "Dining",
    icon: "dining",
  },
  {
    id: "romantic-setup",
    name: "Romantic Evening Setup",
    description:
      "Rose petals, candlelight, and champagne presented upon evening turn-down.",
    price: 15000,
    category: "Special Setup",
    icon: "setup",
  },
];

const iconMap = {
  car: Car,
  spa: Sparkles,
  dining: UtensilsCrossed,
  setup: Flower2,
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-amber-400/70 will-change-transform";

export default function Step2Personalize() {
  const guestDetails = useBookingStore((state) => state.guestDetails);
  const selectedAddons = useBookingStore((state) => state.selectedAddons);
  const updateGuestDetails = useBookingStore(
    (state) => state.updateGuestDetails,
  );
  const toggleAddon = useBookingStore((state) => state.toggleAddon);
  const setStep = useBookingStore((state) => state.setStep);

  const [addons, setAddons] = useState(PLACEHOLDER_ADDONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAddons = async () => {
      try {
        const response = await fetch(API_URL);
        const payload = await response.json().catch(() => null);

        if (!response.ok || !isMounted) {
          return;
        }

        const apiAddons = Array.isArray(payload?.data) ? payload.data : [];

        if (apiAddons.length > 0) {
          const iconByCategory = {
            Transport: "car",
            Wellness: "spa",
            Dining: "dining",
            "Special Setup": "setup",
            Other: "spa",
          };

          setAddons(
            apiAddons.map((addon) => ({
              id: addon._id,
              name: addon.name,
              description: addon.description,
              price: addon.price,
              category: addon.category,
              icon: iconByCategory[addon.category] || "spa",
            })),
          );
        }
      } catch {
        // Gracefully fall back to curated placeholder addons.
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAddons();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = (field) => (event) => {
    updateGuestDetails({ [field]: event.target.value });
  };

  const canContinue =
    guestDetails.firstName.trim() &&
    guestDetails.lastName.trim() &&
    guestDetails.email.trim() &&
    guestDetails.phone.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="will-change-transform"
    >
      <div className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
          Stage Two
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Personalize Your Stay
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
          Share your details and elevate the experience with bespoke
          enhancements curated by our concierge.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
              Guest Details
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Your Information
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                <User size={14} className="text-amber-300" />
                First Name
              </span>
              <input
                type="text"
                value={guestDetails.firstName}
                onChange={handleFieldChange("firstName")}
                placeholder="Alexander"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                <User size={14} className="text-amber-300" />
                Last Name
              </span>
              <input
                type="text"
                value={guestDetails.lastName}
                onChange={handleFieldChange("lastName")}
                placeholder="Montclair"
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                <Mail size={14} className="text-amber-300" />
                Email Address
              </span>
              <input
                type="email"
                value={guestDetails.email}
                onChange={handleFieldChange("email")}
                placeholder="guest@example.com"
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/55">
                <Phone size={14} className="text-amber-300" />
                Phone Number
              </span>
              <input
                type="tel"
                value={guestDetails.phone}
                onChange={handleFieldChange("phone")}
                placeholder="+94 77 000 0000"
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                Special Requests
              </span>
              <textarea
                rows={4}
                value={guestDetails.specialRequests}
                onChange={handleFieldChange("specialRequests")}
                placeholder="Late arrival, dietary preferences, celebration arrangements..."
                className={`${inputClass} resize-none`}
              />
            </label>
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
              Enhance Your Stay
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Curated Add-ons
            </h3>
            <p className="mt-2 text-sm text-white/55">
              Select optional experiences to complement your residence.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {addons.map((addon, index) => {
                const Icon = iconMap[addon.icon] || Sparkles;
                const isSelected = selectedAddons.some(
                  (item) => item.id === addon.id,
                );

                return (
                  <motion.button
                    key={addon.id}
                    type="button"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    onClick={() => toggleAddon(addon)}
                    className={`w-full rounded-[1.5rem] border p-5 text-left transition-all duration-300 will-change-transform ${
                      isSelected
                        ? "border-amber-400/45 bg-amber-400/[0.08] shadow-[0_18px_50px_rgba(212,165,116,0.12)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                          isSelected
                            ? "border-amber-400/30 bg-amber-400/15 text-amber-200"
                            : "border-white/10 bg-black/25 text-amber-300"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-medium text-white">
                              {addon.name}
                            </h4>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/45">
                              {addon.category}
                            </p>
                          </div>
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              isSelected
                                ? "border-amber-400 bg-amber-400 text-black"
                                : "border-white/20 bg-transparent text-transparent"
                            }`}
                          >
                            <Check size={14} />
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/65">
                          {addon.description}
                        </p>
                        <p className="mt-4 text-sm font-medium text-amber-200">
                          {formatPrice(addon.price)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="mt-12 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="lux-action inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-amber-400/40 hover:text-amber-200 will-change-transform"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={!canContinue}
          className="lux-action inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] will-change-transform disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to Checkout
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
