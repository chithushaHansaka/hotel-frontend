"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Sparkles, Star } from "lucide-react";
import { reloadRoute } from "../../lib/reloadNavigation";
import "swiper/css";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/settings";
const AMENITIES_API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/amenities";
const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=100";

const defaultSettings = {
  heroTitle: "Awaken to a new kind of luxury",
  heroSubtitle:
    "A private collection of suites, culinary obelisks, and timeless service — tailored to the discerning traveler.",
  heroBanners: [],
  homeStats: [
    { value: "58", label: "Bespoke Ocean-View Suites" },
    { value: "1:1", label: "Personal Butler-to-Guest Ratio" },
    { value: "4", label: "Signature Culinary Venues" },
    { value: "360°", label: "Panoramic Colombo Views" },
  ],
  aboutText:
    "Since its earliest days, the hotel has been defined by a quiet devotion to elegance: spaces designed to soothe, service that anticipates, and experiences that feel timeless the moment they are lived.",
};

const chronicles = [
  {
    id: 1,
    text: '"A masterpiece in private luxury. From the seamless in-villa arrival to the personalized culinary rituals, every moment felt cinematic. The definition of refined serenity."',
    name: "- Elena M., Modern Connoisseur",
  },
  {
    id: 2,
    text: '"The Service of Anticipation is not a myth here. My preference for high-grown Ceylon tea was noted before I even asked. Unrivaled attention to detail."',
    name: "- David L., Luxury Travel Curator",
  },
  {
    id: 3,
    text: '"A dining experience that transcends flavor. The Chef’s Table was an artisanal journey, perfectly paired with the breathtaking panoramic Colombo skyline views."',
    name: "- Sophie K., Gastronomy Critic",
  },
  {
    id: 4,
    text: '"The holistic spa renewal pass was exactly what we needed. Rejuvenation in absolute luxury, with therapies that felt deeply personal and timeless."',
    name: "- Kenji T., Wellness Advocate",
  },
  {
    id: 5,
    text: '"Our private events team curated the perfect anniversary dinner Canvas. Intimate, flawlessly executed, and deeply romantic by the oceanfront."',
    name: "- Maria K., Global Explorer",
  },
  {
    id: 6,
    text: '"The panoramic Colombo skyline views from the Horizon Rooftop Bar are cinematic. A true gem in the heart of the city."',
    name: "- Aiden J., Singapore",
  },
];

export default function Page() {
  const [settings, setSettings] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Clean data fetching approach without blocking render or manually hacking BFCache
    const loadData = async () => {
      try {
        const [settingsRes, amenitiesRes] = await Promise.all([
          fetch(API_URL)
            .then((res) => res.json())
            .catch(() => null),
          fetch(AMENITIES_API_URL)
            .then((res) => res.json())
            .catch(() => null),
        ]);

        if (!isMounted) return;

        // Apply settings gracefully
        if (settingsRes?.data) {
          const payload = settingsRes;
          setSettings({
            heroTitle: payload?.data?.heroTitle || defaultSettings.heroTitle,
            heroSubtitle:
              payload?.data?.heroSubtitle || defaultSettings.heroSubtitle,
            heroBanners: Array.isArray(payload?.data?.heroBanners)
              ? payload.data.heroBanners
              : [],
            homeStats: Array.isArray(payload?.data?.homeStats)
              ? payload.data.homeStats.slice(0, 4).map((item, index) => ({
                  value:
                    typeof item?.value === "string"
                      ? item.value
                      : defaultSettings.homeStats[index].value,
                  label:
                    typeof item?.label === "string"
                      ? item.label
                      : defaultSettings.homeStats[index].label,
                }))
              : defaultSettings.homeStats,
            aboutText: payload?.data?.aboutText || defaultSettings.aboutText,
          });
        } else {
          setSettings(defaultSettings);
        }

        // Apply amenities gracefully
        if (amenitiesRes?.success) {
          setAmenities(amenitiesRes.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        if (isMounted) setSettings(defaultSettings);
      } finally {
        // Finally block always sets isReady to true, unblocking the dynamic content
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Non-blocking Skeleton Loader strategy:
  // Instead of a hard conditional return that drops the DOM for BFCache,
  // we render a clean loading state that keeps layout components instantly accessible.
  if (!isReady) {
    return (
      <main className="flex min-h-screen w-full flex-col bg-black items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="h-8 w-8 rounded-full border-t-2 border-r-2 border-amber-500 animate-spin"></div>
          <div className="text-white/40 text-xs tracking-[0.2em] uppercase">
            Loading Experience
          </div>
        </div>
      </main>
    );
  }

  const currentSettings = settings || defaultSettings;
  const safeHeroBanners = currentSettings.heroBanners || [];
  const displayBanners =
    safeHeroBanners.length > 0 ? safeHeroBanners : [FALLBACK_HERO_IMAGE];

  // Standard React lifecycle mounting animations (opacity: 0 -> opacity: 1)
  // Since we waited for isReady, we don't need manual ternary opacity hacks anymore!
  return (
    <main className="flex w-full flex-col bg-black relative">
      <section className="relative h-screen cinematic-mask">
        <div className="absolute inset-0">
          <div className="relative h-screen w-full overflow-hidden">
            <Swiper
              slidesPerView={1}
              loop={displayBanners.length > 1}
              speed={1500}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
              }}
              allowTouchMove={displayBanners.length > 1}
              modules={[Autoplay]}
              className="h-full w-full"
            >
              {displayBanners.map((banner, index) => (
                <SwiperSlide key={`hero-banner-${index}`}>
                  <div className="relative h-full w-full">
                    <img
                      src={banner}
                      alt={`Luxury hotel hero background ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="relative z-20 mx-auto flex h-screen max-w-6xl items-center px-6 py-28 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 backdrop-blur-md shadow-[0_6px_24px_rgba(0,0,0,0.35)] transform-gpu"
            >
              Private Arrival Experience
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-shadow-[0_4px_18px_rgba(0,0,0,0.9)] drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)] [text-wrap:balance] sm:text-6xl lg:text-7xl text-white transform-gpu"
            >
              {currentSettings.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="mt-6 max-w-2xl text-base leading-8 text-white/90 [text-shadow:0_2px_14px_rgba(0,0,0,0.85)] sm:text-lg lg:text-xl transform-gpu"
            >
              {currentSettings.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="mt-10 flex flex-wrap gap-4 transform-gpu"
            >
              <a
                href="/rooms"
                onClick={(event) => reloadRoute(event, "/rooms")}
                className="lux-action inline-flex items-center justify-center gap-3 rounded-full bg-amber-500 px-6 py-3.5 font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.35)] hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
              >
                Book your stay
              </a>
              <a
                href="#amenities"
                className="lux-action inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-black/75 px-6 py-3.5 text-sm font-medium text-white shadow-[0_10px_28px_rgba(0,0,0,0.42)] hover:bg-black/85"
              >
                Explore amenities
              </a>
            </motion.div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/70" />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center xl:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1, margin: "0px 0px 100px 0px" }}
            style={{ willChange: "transform, opacity" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-xl transform-gpu"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">
              The hotel story
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              A legacy shaped by hospitality, crafted for the modern
              connoisseur.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-white/72 sm:text-lg">
              {currentSettings.aboutText}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1, margin: "0px 0px 100px 0px" }}
            style={{ willChange: "transform, opacity" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transform-gpu"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,163,107,0.14),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_32%)]" />
            <div className="relative grid gap-6 sm:grid-cols-2">
              {currentSettings.homeStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"
                >
                  <div className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/68 sm:text-[15px]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="amenities"
        className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px 100px 0px" }}
          style={{ willChange: "transform, opacity" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl transform-gpu"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/55">
            Curated comforts
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Premium Amenities
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
            Three signature amenities shaped for a five-star stay: restorative
            wellness, elevated fitness, and an infinity-edge retreat.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((amenity, index) => {
            const safeImages =
              amenity.images?.length > 0
                ? amenity.images
                : [FALLBACK_HERO_IMAGE];

            return (
              <motion.article
                key={amenity._id || index}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  amount: 0.1,
                  margin: "0px 0px 100px 0px",
                }}
                style={{ willChange: "transform, opacity" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] lg:col-span-1 transform-gpu"
              >
                <div className="flex h-full flex-col">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-t-[2rem]">
                    <Swiper
                      slidesPerView={1}
                      loop={safeImages.length > 1}
                      grabCursor={true}
                      speed={1200}
                      autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                      }}
                      allowTouchMove={safeImages.length > 1}
                      resistanceRatio={0}
                      watchSlidesProgress
                      modules={[Autoplay]}
                      className="h-full w-full"
                    >
                      {safeImages.map((image, imageIndex) => (
                        <SwiperSlide
                          key={`amenity-${amenity._id}-img-${imageIndex}`}
                        >
                          <div className="relative h-full w-full overflow-hidden">
                            <img
                              src={image}
                              alt={`${amenity.title} view ${imageIndex + 1}`}
                              className="h-full w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-black/10" />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  <div className="flex flex-1 flex-col justify-end p-6 sm:p-8">
                    <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/75 backdrop-blur-md">
                      <Sparkles size={12} />
                      {amenity.tag || "Signature experience"}
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {amenity.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-white/78 sm:text-base line-clamp-3">
                      {amenity.shortDescription}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/amenities"
            onClick={(event) => reloadRoute(event, "/amenities")}
            className="lux-action inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3.5 font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
          >
            Explore All Amenities
          </Link>
        </div>
      </section>

      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden py-16 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1920&q=100')] bg-cover bg-center bg-scroll md:bg-fixed" />
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0.01, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some", margin: "100px 0px 0px 0px" }}
          style={{ willChange: "transform, opacity" }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl px-4 md:px-8 lg:px-16 text-center transform-gpu"
        >
          <p className="text-3xl font-light italic leading-snug tracking-wide text-white sm:text-4xl md:text-5xl lg:text-6xl">
            “Where time stands still, and luxury is profoundly personal.”
          </p>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px 100px 0px" }}
          style={{ willChange: "transform, opacity" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center transform-gpu"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">
              Culinary moments
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Culinary Excellence
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
              From tasting menus to private dining rituals, our kitchen blends
              precision, seasonality, and atmosphere into one memorable table.
            </p>
            <a
              href="/dining"
              onClick={(event) => reloadRoute(event, "/dining")}
              className="lux-action mt-8 inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.35)] hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
            >
              View Menus
            </a>
          </div>

          <div className="group overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=100"
                alt="Culinary Excellence"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px 100px 0px" }}
          style={{ willChange: "transform, opacity" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl transform-gpu"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/55">
            Guest voices
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Guest Chronicles
          </h2>
        </motion.div>

        <div className="mt-12 overflow-hidden">
          <div className="flex w-max animate-custom-marquee gap-6 hover:[animation-play-state:paused]">
            {[...chronicles, ...chronicles].map((testimonial, index) => (
              <motion.article
                key={`${testimonial.id}-${index}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  amount: 0.1,
                  margin: "0px 0px 100px 0px",
                }}
                style={{ willChange: "transform, opacity" }}
                transition={{
                  duration: 0.7,
                  delay: (index % chronicles.length) * 0.06,
                  ease: "easeOut",
                }}
                className="w-[350px] shrink-0 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transform-gpu"
              >
                <div className="text-sm uppercase tracking-[0.3em] text-amber-300/80">
                  Testimonial
                </div>
                <div className="mt-4 flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`${testimonial.id}-star-${i}`}
                      size={14}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="mt-4 text-lg leading-8 text-white/85">
                  {testimonial.text}
                </p>
                <p className="mt-5 text-sm font-medium tracking-wide text-white/55">
                  {testimonial.name}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
