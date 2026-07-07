"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  UtensilsCrossed,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookingModal from "../../../components/BookingModal";

const tabs = ["Packages", "Offers"];
const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/offers";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatOfferDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPrice = (value) => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return "Contact us";
  }

  return `LKR ${numericValue.toLocaleString()}`;
};

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState("Packages");
  const [selectedItem, setSelectedItem] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOffers = async () => {
      try {
        const response = await fetch(API_URL);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load offers.");
        }

        if (isMounted) {
          setOffers(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load offers.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return offers.filter(
      (item) => (item.tab || "Offers") === activeTab && item.isActive !== false,
    );
  }, [activeTab, offers]);

  const sectionLabel =
    activeTab === "Packages" ? "Premium packages" : "Exclusive offers";
  const sectionDescription =
    activeTab === "Packages"
      ? "Curated experiences designed for celebrations, wellness, romance, and private enterprise."
      : "Limited-time privileges crafted for elevated stays, dining, and long-haul luxury.";

  const openOfferBooking = (item) => {
    setSelectedItem(item.title);
    setIsBookingOpen(true);
  };

  const fallbackMessage = "New luxury offers and packages coming soon";

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(32,40,52,0.98),_rgba(5,6,8,1))] text-white">
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">
            Curated privileges
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Offers & Packages
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            Discover a unified luxury hub of premium packages and exclusive
            offers, designed for a more elegant arrival, a more memorable table,
            and more reasons to linger.
          </p>
        </motion.div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/30 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                    isActive ? "text-black" : "text-white/75 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="offers-tab-indicator"
                      className="absolute inset-0 rounded-full bg-amber-400"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="mt-10 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-[2rem] border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 px-8 py-16 text-center text-white/65 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200">
              <WandSparkles size={24} />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white">
              {fallbackMessage}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/60">
              We are curating new packages and time-limited offers for the next
              release.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredItems.map((item, index) => {
                const itemSlug = slugify(item.slug || item.title);
                const primaryImage = item.images?.[0] || FALLBACK_IMAGE;
                const validFrom = formatOfferDate(item.startDate);
                const validUntil = formatOfferDate(item.endDate);
                const isOffer = (item.tab || "Offers") === "Offers";

                return (
                  <motion.article
                    key={item._id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: index * 0.08 }}
                    className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-md"
                  >
                    <div className="relative h-[280px] overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/28 to-transparent" />

                      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
                        <WandSparkles size={12} className="text-amber-300" />
                        {item.tab || "Offer"}
                      </div>

                      <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/75 backdrop-blur-md">
                        {item.category === "Dining" ? (
                          <UtensilsCrossed
                            size={12}
                            className="text-amber-300"
                          />
                        ) : (
                          <ChevronRight size={12} className="text-amber-300" />
                        )}
                        {item.category || sectionLabel}
                      </div>

                      {isOffer && validFrom && validUntil ? (
                        <div className="absolute right-5 top-5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-100 backdrop-blur-md">
                          Valid: {validFrom} - {validUntil}
                        </div>
                      ) : null}
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                          {item.title}
                        </h2>
                        <div className="shrink-0 text-right">
                          <div className="text-xs uppercase tracking-[0.25em] text-white/50">
                            {sectionLabel}
                          </div>
                          <div className="text-sm font-medium text-amber-300">
                            {isOffer && validUntil
                              ? `Valid until: ${validUntil}`
                              : item.tab || "Package"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
                        {formatPrice(item.fromPrice)}
                      </div>

                      <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                        {item.description}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/offers/${itemSlug}`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-amber-500 hover:text-amber-500"
                        >
                          View Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => openOfferBooking(item)}
                          className="lux-action inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
                        >
                          {activeTab === "Packages" ? "Explore" : "Claim Offer"}
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/75 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-md sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ChevronRight className="text-amber-300" size={18} />
              <span>{sectionDescription}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedItem(sectionLabel);
                setIsBookingOpen(true);
              }}
              className="lux-action inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 font-medium text-black"
            >
              Request Inquiry <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          type="offer"
          contextTitle={selectedItem || sectionLabel}
        />
      </section>
    </main>
  );
}
