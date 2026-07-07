"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/dining";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function DiningPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDiningItem, setSelectedDiningItem] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDiningItems = async () => {
      try {
        const response = await fetch(API_URL);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load dining items.");
        }

        if (isMounted) {
          setItems(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load dining items.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDiningItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeItems = useMemo(
    () => items.filter((item) => item.isActive !== false),
    [items],
  );

  const fallbackMessage = "New luxury dining experiences coming soon";

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.98),_rgba(5,6,8,1))] text-white">
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Culinary destination
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Culinary Excellence
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/80 sm:text-lg lg:text-xl">
            A symphony of flavors crafted for the modern epicurean
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        {error ? (
          <div className="mb-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md"
              >
                <div className="grid min-h-[420px] gap-0 md:grid-cols-2">
                  <div className="animate-pulse bg-white/8" />
                  <div className="space-y-5 p-8 lg:p-12">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-white/8" />
                    <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-white/8" />
                    <div className="h-24 w-full animate-pulse rounded-2xl bg-white/8" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="h-20 animate-pulse rounded-2xl bg-white/8" />
                      <div className="h-20 animate-pulse rounded-2xl bg-white/8" />
                    </div>
                    <div className="h-12 w-40 animate-pulse rounded-full bg-white/8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeItems.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-16 text-center text-white/65 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200">
              <Sparkles size={24} />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white">
              {fallbackMessage}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/60">
              Our culinary team is preparing new dining concepts and seasonal
              signature experiences.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-24 py-24">
            {activeItems.map((venue, index) => {
              const reverse = index % 2 === 1;
              const primaryImage = venue.images?.[0] || FALLBACK_IMAGE;
              const venueSlug = slugify(venue.slug || venue.name);
              const highlights = Array.isArray(venue.highlights)
                ? venue.highlights.filter(Boolean)
                : [];

              return (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md md:flex-row ${reverse ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="h-full w-full md:w-1/2">
                    <img
                      src={primaryImage}
                      alt={venue.name}
                      className="h-full min-h-[420px] w-full object-cover md:min-h-[520px]"
                    />
                  </div>

                  <div className="flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-12">
                    <p className="text-xs uppercase tracking-[0.35em] text-amber-200/75">
                      Dining Experience
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-wide text-white sm:text-4xl lg:text-5xl">
                      {venue.name}
                    </h2>
                    <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
                      {venue.description}
                    </p>

                    {highlights.length > 0 ? (
                      <div className="mt-7 flex flex-wrap gap-3">
                        {highlights.slice(0, 4).map((highlight) => (
                          <span
                            key={highlight}
                            className="inline-flex items-center rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link
                        href={`/dining/${venueSlug}`}
                        className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-amber-500 hover:text-amber-500"
                      >
                        {venue.buttonLabel || "View Details"}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedDiningItem(venue.name)}
                        className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
                      >
                        Book Experience
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <section className="py-24 bg-zinc-900/30">
        <div className="container mx-auto flex flex-col items-center gap-16 px-6 md:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="w-full md:w-1/3"
          >
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop"
              alt="Executive Chef Alexander Rossi"
              className="h-[500px] w-full rounded-t-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="w-full md:w-2/3"
          >
            <p className="text-xs uppercase tracking-[0.45em] text-amber-300/80">
              The Culinary Director
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Chef Alexander Rossi
            </h2>
            <p className="mt-6 max-w-3xl text-2xl italic leading-relaxed text-white/85 sm:text-3xl">
              "Cooking is not just about ingredients; it is about telling a
              story on a plate."
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              With a celebrated 3-Michelin-star background, Chef Alexander Rossi
              brings disciplined technique, artistic composition, and an
              unwavering respect for seasonality to every dining experience. His
              philosophy blends modern gastronomy with expressive plating and
              the finest produce, creating meals that feel both intimate and
              unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      <BookingModal
        isOpen={Boolean(selectedDiningItem)}
        onClose={() => setSelectedDiningItem("")}
        type="dining"
        contextTitle={selectedDiningItem || "Dining experience"}
      />
    </main>
  );
}
