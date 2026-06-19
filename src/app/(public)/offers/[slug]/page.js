"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Tag,
  WandSparkles,
} from "lucide-react";
import BookingModal from "../../../../components/BookingModal";

const API_URL = "http://localhost:5000/api/offers";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop";

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

export default function OfferDetailPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");

  const params = useParams();
  const slug = params?.slug;

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
          setItems(Array.isArray(payload?.data) ? payload.data : []);
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

  const item = useMemo(
    () =>
      items.find((entry) => slugify(entry.slug || entry.title) === slug) ||
      null,
    [items, slug],
  );

  const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
  const highlights = Array.isArray(item?.highlights)
    ? item.highlights.filter(Boolean)
    : [];
  const primaryImage = images[0] || FALLBACK_IMAGE;
  const validFrom = formatOfferDate(item?.startDate);
  const validUntil = formatOfferDate(item?.endDate);
  const isOffer = (item?.tab || "Offers") === "Offers";
  const fallbackMessage = "New luxury offers and packages coming soon";

  if (error) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(32,40,52,0.98),_rgba(5,6,8,1))] px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-200/80">
            Offer detail
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Unable to load offer</h1>
          <p className="mt-3 text-white/70">{error}</p>
          <Link
            href="/offers"
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-500 hover:text-white transition-all duration-200"
          >
            Back to Offers
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(32,40,52,0.98),_rgba(5,6,8,1))] px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md">
          <div className="grid min-h-[70vh] gap-0 lg:grid-cols-2">
            <div className="animate-pulse bg-white/8" />
            <div className="space-y-5 p-8 lg:p-12">
              <div className="h-6 w-28 animate-pulse rounded-full bg-white/8" />
              <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-white/8" />
              <div className="h-28 w-full animate-pulse rounded-2xl bg-white/8" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="h-20 animate-pulse rounded-2xl bg-white/8" />
                <div className="h-20 animate-pulse rounded-2xl bg-white/8" />
                <div className="h-20 animate-pulse rounded-2xl bg-white/8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(32,40,52,0.98),_rgba(5,6,8,1))] px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200">
            <Sparkles size={24} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">
            {fallbackMessage}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/65">
            We are preparing new premium packages and curated offers.
          </p>
          <Link
            href="/offers"
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-500 hover:text-white transition-all duration-200"
          >
            Back to Offers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(32,40,52,0.98),_rgba(5,6,8,1))] text-white">
      <section className="px-6 py-10">
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-500 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Back to Offers
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md"
        >
          <div className="grid min-h-[70vh] gap-0 lg:grid-cols-2">
            <div className="relative min-h-[420px] lg:min-h-full">
              <img
                src={primaryImage}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>

            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/75">
                <WandSparkles size={12} className="text-amber-300" />
                {item.tab || "Offer"}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {item.title}
              </h1>
              <p className="mt-4 text-sm uppercase tracking-[0.32em] text-white/45">
                {item.category || item.tab || "Offer"}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                {item.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Tag className="text-amber-300" size={18} />
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/45">
                    From
                  </div>
                  <div className="mt-1 text-sm text-white/80">
                    {formatPrice(item.fromPrice)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <CheckCircle className="text-amber-300" size={18} />
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/45">
                    Type
                  </div>
                  <div className="mt-1 text-sm text-white/80">
                    {item.tab || "Package"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Sparkles className="text-amber-300" size={18} />
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/45">
                    Dates
                  </div>
                  <div className="mt-1 text-sm text-white/80">
                    {isOffer && validFrom && validUntil
                      ? `${validFrom} - ${validUntil}`
                      : "No date range"}
                  </div>
                </div>
              </div>

              {isOffer && validFrom && validUntil ? (
                <div className="mt-5 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-amber-100">
                  Valid: {validFrom} - {validUntil}
                </div>
              ) : null}

              {highlights.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-amber-100"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(item.title);
                    setIsBookingOpen(true);
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)]"
                >
                  Book This Offer
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-amber-500 hover:text-amber-300"
                >
                  Contact Concierge
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {images.length > 1 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.slice(1, 4).map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5"
              >
                <img
                  src={image}
                  alt={item.title}
                  className="h-72 w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        type="offer"
        contextTitle={selectedItem || item.title}
      />
    </main>
  );
}
