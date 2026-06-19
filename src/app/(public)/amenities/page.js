"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { reloadRoute } from "../../../lib/reloadNavigation";

const API_URL = "http://localhost:5000/api/amenities";
const SETTINGS_API_URL = "http://localhost:5000/api/settings";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=100";
const FALLBACK_HERO = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=100";

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState([]);
  const [heroImage, setHeroImage] = useState(null); // Prevent dummy flash
  const [isReady, setIsReady] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Bulletproof BFCache Restore
    const handlePageShow = (event) => {
      if (event.persisted) {
        setIsReady(true);
        setIsFirstVisit(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    // Check session storage immediately on mount
    const hasVisited = sessionStorage.getItem("thelux_visited");
    if (hasVisited) {
      setIsFirstVisit(false);
    }

    const fetchData = async () => {
      try {
        // Fetch both Amenities and Settings (for the Hero Banner) simultaneously
        const [amenitiesRes, settingsRes] = await Promise.all([
          fetch(API_URL).then(res => res.json()).catch(() => null),
          fetch(SETTINGS_API_URL).then(res => res.json()).catch(() => null)
        ]);

        if (!isMounted) return;

        if (amenitiesRes?.success) {
          setAmenities(amenitiesRes.data);
        }

        if (settingsRes?.data?.heroBanners?.length > 0) {
          setHeroImage(settingsRes.data.heroBanners[0]);
        } else {
          setHeroImage(FALLBACK_HERO);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (isMounted && !heroImage) setHeroImage(FALLBACK_HERO);
      } finally {
        if (isMounted) {
          setIsReady(true);
          // Set session storage so future navigations are instant
          sessionStorage.setItem("thelux_visited", "true");
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const displayHeroImage = heroImage || FALLBACK_HERO;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      
      {/* Seamless Phantom Overlay for robust BFCache loading without hard conditional black screens */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="phantom-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ display: isReady ? "none" : "block" }}
            className="pointer-events-none fixed inset-0 z-[100] bg-black"
          />
        )}
      </AnimatePresence>

      {/* Premium Ambient Blur Mask Layer (Only on first visit) */}
      <AnimatePresence>
        {isFirstVisit && isReady && (
          <motion.div
            initial={{ opacity: 1, backdropFilter: "blur(24px)" }}
            animate={{ opacity: 0, backdropFilter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="pointer-events-none fixed inset-0 z-50 bg-black/40"
          />
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden">
        <div className="relative h-[48vh] sm:h-[56vh] lg:h-[64vh]">
          <img
            src={displayHeroImage}
            alt="Curated Excellence"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              
              {/* Element 1: Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
                className="text-sm uppercase tracking-widest text-white/60 transform-gpu"
              >
                Curated Collection
              </motion.p>
              
              {/* Element 2: Title */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
                className="mt-4 text-4xl sm:text-6xl font-bold transform-gpu"
              >
                Curated Excellence
              </motion.h1>

              {/* Element 3: Description */}
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
                className="mt-4 max-w-2xl mx-auto text-base text-white/75 transform-gpu"
              >
                A thoughtfully curated collection of signature services and
                amenities tailored to a refined arrival.
              </motion.p>

            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-6 py-20 bg-black">
          {amenities.length === 0 ? (
            <div className="text-center text-white/50 py-20">
              No amenities found.
            </div>
          ) : (
            amenities.map((item, i) => {
              const reverse = i % 2 === 1;
              
              const displayImage = item.images && item.images.length > 0 
                ? item.images[0] 
                : FALLBACK_IMAGE;

              const displaySubtitle = item.features && item.features.length > 0 
                ? item.features.join(" • ") 
                : item.shortDescription;

              return (
                <motion.section
                  key={item._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1, margin: "0px 0px 100px 0px" }}
                  style={{ willChange: "transform, opacity" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`flex flex-col lg:flex-row items-center gap-8 py-12 ${
                    reverse ? "lg:flex-row-reverse" : ""
                  } transform-gpu`}
                >
                  <div className="lg:w-1/2 w-full rounded-2xl overflow-hidden shadow-xl border border-white/5">
                    <img
                      src={displayImage}
                      alt={item.title}
                      className="w-full h-[400px] object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>

                  <div className="lg:w-1/2 w-full pl-0 lg:pl-8">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-500/90 backdrop-blur-md">
                      <Sparkles size={12} />
                      {item.tag || "Signature Experience"}
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-4 text-base leading-relaxed text-white/70">{displaySubtitle}</p>
                    <div className="mt-8">
                      <Link
                        href={`/amenities/${item._id}`}
                        onClick={(e) => reloadRoute(e, `/amenities/${item._id}`)}
                        className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-amber-500 hover:text-black hover:border-amber-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.section>
              );
            })
          )}
        </section>
      </section>
    </main>
  );
}