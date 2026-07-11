"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, UtensilsCrossed } from "lucide-react";
import BookingModal from "../../../../components/BookingModal";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/dining";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function DiningDetailPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDiningItem, setSelectedDiningItem] = useState("");

  const params = useParams();
  const slug = params?.slug;

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

  const venue = useMemo(
    () =>
      items.find((item) => slugify(item.slug || item.name) === slug) || null,
    [items, slug],
  );

  const menuItems = Array.isArray(venue?.menu) ? venue.menu : [];
  const primaryImage = venue?.images?.[0] || FALLBACK_IMAGE;
  const fallbackMessage = "New luxury dining experiences coming soon";

  if (error) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.98),_rgba(5,6,8,1))] px-6 pb-24 pt-32 text-white sm:pt-36">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-200/80">
            Dining detail
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Unable to load venue</h1>
          <p className="mt-3 text-white/70">{error}</p>
          <Link
            href="/dining"
            className="mt-8 inline-flex rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black"
          >
            Back to Dining
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.98),_rgba(5,6,8,1))] px-6 pb-24 pt-32 text-white sm:pt-36">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md">
          <div className="grid min-h-[70vh] gap-0 lg:grid-cols-2">
            <div className="animate-pulse bg-white/8" />
            <div className="space-y-5 p-8 lg:p-12">
              <div className="h-6 w-28 animate-pulse rounded-full bg-white/8" />
              <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-white/8" />
              <div className="h-28 w-full animate-pulse rounded-2xl bg-white/8" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!venue) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.98),_rgba(5,6,8,1))] px-6 pb-24 pt-32 text-white sm:pt-36">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200">
            <Sparkles size={24} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">
            {fallbackMessage}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/65">
            We are preparing new dining experiences for the next seasonal menu.
          </p>
          <Link
            href="/dining"
            className="mt-8 inline-flex rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black"
          >
            Back to Dining
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.98),_rgba(5,6,8,1))] text-white">
      <section className="px-6 pb-10 pt-32 sm:pt-36">
        <Link
          href="/dining"
          className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-amber-300"
        >
          <ArrowLeft size={16} />
          Back to Dining
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md"
        >
          <div className="relative min-h-[72vh] overflow-hidden">
            <Image
              src={primaryImage}
              alt={venue.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,8,0.32),rgba(4,6,8,0.84))]" />

            <div className="relative z-10 flex min-h-[72vh] flex-col justify-end p-8 sm:p-12 lg:p-16">
              <div className="max-w-4xl">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-100/90 backdrop-blur-md">
                  <Sparkles size={12} className="text-amber-300" />
                  Dining Experience
                </div>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  {venue.name}
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-white/78 sm:text-lg lg:text-xl">
                  {venue.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDiningItem(venue.name);
                      setIsBookingOpen(true);
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)]"
                  >
                    Reserve Dining Experience
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-amber-500 hover:text-amber-300"
                  >
                    Ask a Question
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 border-t border-white/10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-amber-200/80">
                <UtensilsCrossed size={14} />
                Menu
              </div>

              {menuItems?.length > 0 ? (
                <div className="mt-8 space-y-4">
                  {menuItems.map((menuItem, index) => {
                    const priceValue =
                      typeof menuItem?.price === "number"
                        ? menuItem.price
                        : Number(menuItem?.price);

                    const formattedPrice = Number.isFinite(priceValue)
                      ? new Intl.NumberFormat("en-LK", {
                          style: "currency",
                          currency: "LKR",
                          maximumFractionDigits: 0,
                        }).format(priceValue)
                      : "Price on request";

                    return (
                      <div
                        key={`${menuItem?.name || "menu-item"}-${index}`}
                        className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-100">
                            <Sparkles size={14} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-3">
                              <h2 className="text-lg font-medium tracking-wide text-white sm:text-xl">
                                {menuItem?.name || "Untitled Item"}
                              </h2>
                              <div className="flex-1 border-b border-dotted border-white/15 translate-y-[-4px]" />
                              <span className="text-sm font-semibold text-amber-300 sm:text-base">
                                {formattedPrice}
                              </span>
                            </div>

                            {menuItem?.description ? (
                              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                                {menuItem.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/20 px-6 py-8 text-white/65">
                  Menu updates coming soon.
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-zinc-950/35 p-8 sm:p-10 lg:border-t-0 lg:border-l lg:p-12">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-md">
                <div className="text-xs uppercase tracking-[0.35em] text-amber-200/75">
                  Private Dining
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  A refined dining ritual designed for memorable evenings.
                </h2>
                <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">
                  Reserve your table, then let our team tailor the experience
                  with discreet service, elevated plating, and an atmosphere
                  that feels intimate and polished.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        type="dining"
        contextTitle={selectedDiningItem || venue.name}
      />
    </main>
  );
}
