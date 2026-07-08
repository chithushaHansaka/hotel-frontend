"use client";

import { useEffect, useMemo, useState } from "react";
import { Bed, Eye, Maximize, Map, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/rooms";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542314831-c6a4d14ecc8a?q=80&w=1600&auto=format&fit=crop";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatPrice = (price) => {
  if (typeof price !== "number" || Number.isNaN(price)) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      try {
        const response = await fetch(API_URL);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load rooms.");
        }

        if (isMounted) {
          setRooms(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load rooms.",
          );
        }
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

  const featuredRooms = useMemo(() => rooms.slice(0, 6), [rooms]);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.95),_rgba(5,6,8,1))] text-white">
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d14ecc8a?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/55" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
            Signature Stays
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg lg:text-xl">
            Spaces designed for absolute serenity
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 py-24">
        {error ? (
          <div className="mb-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
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
        ) : featuredRooms.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-white/60">
            No rooms found.
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {featuredRooms.map((room, index) => {
              const reverse = index % 2 === 1;
              const primaryImage = room.images?.[0] || FALLBACK_IMAGE;
              const roomSlug = slugify(room.name);
              const sizeLabel = room.size || "Luxury suite";
              const bedLabel = room.bed || "Signature bed";
              const viewLabel = room.view || "Refined views";
              const inventory = room.inventory ?? room.availableRooms ?? 0;

              return (
                <motion.article
                  key={room._id}
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md md:flex-row ${reverse ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="h-full w-full md:w-1/2">
                    <img
                      src={primaryImage}
                      alt={room.name}
                      className="h-full min-h-[400px] w-full object-cover md:min-h-[500px]"
                    />
                  </div>

                  <div className="flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-12">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-amber-200/90">
                      Premium Room
                    </div>

                    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {room.name}
                    </h2>

                    <p className="mt-5 max-w-xl text-base leading-8 text-white/72 sm:text-lg">
                      {room.description}
                    </p>

                    {/* Dynamic Inventory Highlight */}
                    {inventory > 0 && (
                      <div className="flex items-center gap-2 mt-4 text-sm font-medium text-amber-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                        {inventory} {inventory === 1 ? "Suite" : "Suites"}{" "}
                        Available
                      </div>
                    )}

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="mt-0.5 text-amber-300">
                          <Maximize size={18} />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                            Size
                          </div>
                          <div className="mt-1 text-sm text-white/80">
                            {sizeLabel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="mt-0.5 text-amber-300">
                          <Bed size={18} />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                            Bed
                          </div>
                          <div className="mt-1 text-sm text-white/80">
                            {bedLabel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
                        <div className="mt-0.5 text-amber-300">
                          <Map size={18} />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                            View
                          </div>
                          <div className="mt-1 text-sm text-white/80">
                            {viewLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-sm text-white/70">
                      <Eye size={16} className="text-amber-300" />
                      <span>{formatPrice(room.price)}</span>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link
                        href={`/rooms/${roomSlug}`}
                        className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-amber-500 hover:text-amber-500"
                      >
                        View Details
                      </Link>
                      <Link
                        href="/book"
                        className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
