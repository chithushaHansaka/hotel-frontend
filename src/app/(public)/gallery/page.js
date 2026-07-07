"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Filter, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/gallery";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1600&auto=format&fit=crop";
const DEFAULT_FILTERS = ["All", "Interior", "Exterior", "Events", "Leisure"];

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(API_URL, { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load gallery images.");
        }

        if (isMounted) {
          setGalleryItems(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load gallery images.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  const filters = useMemo(() => {
    const categories = galleryItems
      .map((item) => item?.category)
      .filter(Boolean);

    return [
      ...DEFAULT_FILTERS,
      ...Array.from(new Set(categories)).filter(
        (category) => !DEFAULT_FILTERS.includes(category),
      ),
    ];
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "All") {
      return galleryItems;
    }

    return galleryItems.filter((item) => item?.category === activeFilter);
  }, [activeFilter, galleryItems]);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.98),_rgba(5,6,8,1))] text-white">
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">
            Curated archive
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            The Gallery
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            A live collection of rooms, dining moments, poolside scenes, and
            exterior impressions, managed from the admin dashboard.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/30 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-black" : "text-white/75 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="gallery-filter-indicator"
                    className="absolute inset-0 rounded-full bg-amber-400"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{filter}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="mt-10 rounded-[1.75rem] border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-14 columns-1 gap-5 sm:columns-2 xl:columns-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="mb-5 break-inside-avoid overflow-hidden rounded-[2rem] border border-white/10 bg-white/5"
              >
                <div className="aspect-[4/5] animate-pulse bg-white/8" />
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="mt-14 columns-1 gap-5 sm:columns-2 xl:columns-3">
            {filteredItems.map((item) => (
              <motion.article
                key={item._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="group mb-5 break-inside-avoid overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setSelectedImage(item)}
                  className="relative block w-full text-left"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item?.image || FALLBACK_IMAGE}
                      alt={item?.title || "Gallery image"}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-transparent" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
                      <Sparkles size={12} className="text-amber-300" />
                      {item?.category || "Gallery"}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        {item?.title || "Untitled Image"}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-white/70">
                        Tap to view the image in a larger frame.
                      </p>
                    </div>
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 text-center text-white/65 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-md">
            No gallery images found for this filter.
          </div>
        )}

        <div className="mt-16 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/75 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Camera className="text-amber-300" size={18} />
            <span>
              Live gallery with category filtering and a responsive masonry
              layout.
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Filter size={16} className="text-amber-300" />
            <span>{filteredItems.length} images shown</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition-colors duration-300 hover:border-amber-400 hover:text-amber-300"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
              <img
                src={selectedImage?.image || FALLBACK_IMAGE}
                alt={selectedImage?.title || "Gallery image"}
                className="max-h-[90vh] w-full object-contain"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
