"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  Bed,
  Coffee,
  Eye,
  LayoutGrid,
  MapPinned,
  Wifi,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/rooms";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop";

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

export default function RoomDetailPage() {
  const params = useParams();
  const slug = params?.slug;
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

  const room = useMemo(
    () => rooms.find((item) => slugify(item.name) === slug),
    [rooms, slug],
  );

  const roomImage = room?.images?.[0] || FALLBACK_IMAGE;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.95),_rgba(5,6,8,1))] px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-[70vh] animate-pulse rounded-[2.5rem] bg-white/5" />
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-4">
              <div className="h-8 w-40 animate-pulse rounded-full bg-white/8" />
              <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-white/8" />
              <div className="h-28 w-full animate-pulse rounded-2xl bg-white/8" />
            </div>
            <div className="h-80 animate-pulse rounded-[2rem] bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-center text-rose-100">
          {error}
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300/80">
            Room Not Found
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            This room could not be located.
          </h1>
          <Link
            href="/rooms"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 font-semibold text-black"
          >
            <ArrowLeft size={16} /> Back to All Rooms
          </Link>
        </div>
      </main>
    );
  }

  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  const images =
    Array.isArray(room.images) && room.images.length > 0
      ? room.images
      : [roomImage];
  const stats = [
    { icon: Bed, label: "Bed", value: room.bed || "Signature bedding" },
    { icon: LayoutGrid, label: "Size", value: room.size || "Luxury suite" },
    { icon: MapPinned, label: "View", value: room.view || "Refined outlook" },
    { icon: Wifi, label: "Connectivity", value: "Free Wi-Fi" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.95),_rgba(5,6,8,1))] text-white">
      <section className="relative h-[70vh] overflow-hidden">
        <img
          src={roomImage}
          alt={room.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 flex h-full items-center justify-center px-6 text-center"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              Luxury Room
            </p>
            <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {room.name}
            </h1>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors duration-300 hover:text-amber-400"
        >
          <ArrowLeft size={16} /> Back to All Rooms
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div>
            <p className="text-base leading-8 text-white/78 sm:text-lg">
              {room.description}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.3em] text-white/45">
                          {item.label}
                        </div>
                        <div className="mt-1 text-sm font-medium text-white/85">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Room Features
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {amenities.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/80"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Gallery
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5"
                  >
                    <img
                      src={imageUrl}
                      alt={room.name}
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Booking Summary
              </p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {formatPrice(room.price)}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Secure your preferred dates and enjoy an elevated stay crafted
                for comfort, privacy, and seamless service.
              </p>

              <Link
                href={`/book?roomId=${room._id}`}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-5 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
              >
                Book This Room
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
