"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { reloadRoute } from "../lib/reloadNavigation";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/settings";

type SiteSettings = {
  hotelName: string;
  logoUrl: string;
};

const defaultSettings: SiteSettings = {
  hotelName: "THE LUX",
  logoUrl: "",
};

export default function Header() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await fetch(API_URL);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          return;
        }

        if (isMounted) {
          setSettings({
            hotelName: payload?.data?.hotelName || defaultSettings.hotelName,
            logoUrl: payload?.data?.logoUrl || "",
          });
        }
      } catch {
        // Keep the default brand on network errors.
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinkClassName = (href: string) => {
    const isActive = pathname === href;

    return [
      "relative inline-block transition-all duration-300 hover:-translate-y-0.5 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-bottom-right after:transition-transform after:duration-300",
      isActive
        ? "text-amber-500 after:scale-x-100 after:bg-amber-500 after:origin-bottom-left"
        : "text-zinc-300 hover:text-amber-500 after:scale-x-0 after:bg-amber-500 hover:after:scale-x-100 hover:after:origin-bottom-left",
    ].join(" ");
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-3 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/45 hover:shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="min-w-0 flex items-center gap-3"
        >
          <Link
            href="/"
            onClick={(event) => reloadRoute(event, "/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 font-semibold text-black shadow-lg shadow-amber-500/20 sm:h-12 sm:w-12">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`${settings.hotelName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                settings.hotelName.slice(0, 1)
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase sm:text-sm">
                {settings.hotelName}
              </div>
              <div className="hidden text-xs text-white/60 sm:block">
                Private Collection
              </div>
            </div>
          </Link>
        </motion.div>

        <nav className="hidden md:flex gap-8 items-center text-sm text-white/80">
          <Link
            href="/"
            onClick={(event) => reloadRoute(event, "/")}
            className={navLinkClassName("/")}
          >
            Home
          </Link>
          <Link
            href="/rooms"
            onClick={(event) => reloadRoute(event, "/rooms")}
            className={navLinkClassName("/rooms")}
          >
            Rooms
          </Link>
          <Link
            href="/dining"
            onClick={(event) => reloadRoute(event, "/dining")}
            className={navLinkClassName("/dining")}
          >
            Dining
          </Link>
          <Link
            href="/gallery"
            onClick={(event) => reloadRoute(event, "/gallery")}
            className={navLinkClassName("/gallery")}
          >
            Gallery
          </Link>
          <Link
            href="/offers"
            onClick={(event) => reloadRoute(event, "/offers")}
            className={navLinkClassName("/offers")}
          >
            Offers & Packages
          </Link>
          <Link
            href="/contact"
            onClick={(event) => reloadRoute(event, "/contact")}
            className={navLinkClassName("/contact")}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/book"
            onClick={(event) => reloadRoute(event, "/book")}
            className="lux-action hidden md:inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 font-medium text-black shadow-lg shadow-amber-500/25"
          >
            <Phone size={14} /> Book
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="lux-action inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/80 hover:bg-white/8 hover:text-white md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[100] h-screen w-full bg-black/60 backdrop-blur-2xl md:hidden"
          >
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition-colors hover:border-amber-400/40 hover:text-amber-300"
            >
              <X size={20} />
            </button>

            <nav className="flex h-full flex-col items-center justify-center space-y-8 px-6 text-center">
              <Link
                href="/"
                onClick={(event) => {
                  reloadRoute(event, "/");
                  setIsMobileMenuOpen(false);
                }}
                className="text-2xl font-light tracking-widest text-white transition-colors hover:text-amber-500"
              >
                Home
              </Link>
              <Link
                href="/rooms"
                onClick={(event) => {
                  reloadRoute(event, "/rooms");
                  setIsMobileMenuOpen(false);
                }}
                className="text-2xl font-light tracking-widest text-white transition-colors hover:text-amber-500"
              >
                Rooms
              </Link>
              <Link
                href="/dining"
                onClick={(event) => {
                  reloadRoute(event, "/dining");
                  setIsMobileMenuOpen(false);
                }}
                className="text-2xl font-light tracking-widest text-white transition-colors hover:text-amber-500"
              >
                Dining
              </Link>
              <Link
                href="/gallery"
                onClick={(event) => {
                  reloadRoute(event, "/gallery");
                  setIsMobileMenuOpen(false);
                }}
                className="text-2xl font-light tracking-widest text-white transition-colors hover:text-amber-500"
              >
                Gallery
              </Link>
              <Link
                href="/offers"
                onClick={(event) => {
                  reloadRoute(event, "/offers");
                  setIsMobileMenuOpen(false);
                }}
                className="text-2xl font-light tracking-widest text-white transition-colors hover:text-amber-500"
              >
                Offers & Packages
              </Link>
              <Link
                href="/contact"
                onClick={(event) => {
                  reloadRoute(event, "/contact");
                  setIsMobileMenuOpen(false);
                }}
                className="text-2xl font-light tracking-widest text-white transition-colors hover:text-amber-500"
              >
                Contact
              </Link>

              <Link
                href="/book"
                onClick={(event) => {
                  reloadRoute(event, "/book");
                  setIsMobileMenuOpen(false);
                }}
                className="lux-action mt-10 inline-flex min-w-[14rem] items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-500 px-8 py-3 text-sm font-medium tracking-wide text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(245,158,11,0.55)]"
              >
                <Phone size={14} /> Book
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
