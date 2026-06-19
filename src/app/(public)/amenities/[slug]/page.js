"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { reloadRoute } from "../../../../lib/reloadNavigation";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=100";
const API_URL = "http://localhost:5000/api/amenities";

export default function AmenityPage() {
  const routeParams = useParams();
  const amenityId = routeParams?.slug;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAmenityDetails = async () => {
      if (!amenityId) return;

      try {
        // අපි Database එකෙන් ඔක්කොම Amenities අරන්, අපිට ඕන ID එක තියෙන එක හොයාගන්නවා
        const response = await fetch(API_URL);
        const payload = await response.json();

        if (payload.success && isMounted) {
          const foundAmenity = payload.data.find(
            (item) => item._id === amenityId,
          );
          if (foundAmenity) {
            setData(foundAmenity);
          } else {
            setIsError(true);
          }
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error("Failed to fetch amenity details:", error);
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAmenityDetails();

    return () => {
      isMounted = false;
    };
  }, [amenityId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  if (isError || !data) return notFound();

  // පින්තූර Array එකෙන් පළවෙනි එක ගන්නවා
  const displayImage =
    data.images && data.images.length > 0 ? data.images[0] : FALLBACK_IMAGE;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <section className="relative h-[80vh]">
        <img
          src={displayImage}
          alt={data.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-amber-500/90 font-medium">
              {data.tag || "Signature Amenity"}
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">
              {data.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/82 sm:text-lg">
              {data.shortDescription}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="prose prose-invert prose-lg text-white/80">
            {/* Long description එක තියෙනවා නම් පෙන්නනවා, නැත්නම් short එක පෙන්නනවා */}
            <p className="leading-relaxed whitespace-pre-line">
              {data.longDescription || data.shortDescription}
            </p>
          </div>

          {/* Features තියෙනවා නම් විතරක් මේ කොටස පෙන්නනවා */}
          {data.features && data.features.length > 0 && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
                >
                  <div className="rounded-full bg-amber-500/20 p-2 text-amber-400">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div className="font-medium text-white/90">{feature}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-white/10">
            <Link
              href="/amenities"
              onClick={(e) => reloadRoute(e, "/amenities")}
              className="inline-flex items-center gap-3 rounded-full bg-white/5 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10"
            >
              <ArrowLeft size={16} /> Back to Amenities
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
