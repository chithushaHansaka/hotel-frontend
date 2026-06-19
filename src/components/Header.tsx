"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, Sun } from "lucide-react";
import { reloadRoute } from "../lib/reloadNavigation";

const API_URL = "http://localhost:5000/api/settings";

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
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/45 hover:shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/"
            onClick={(event) => reloadRoute(event, "/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 font-semibold text-black shadow-lg shadow-amber-500/20">
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
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.2em] uppercase">
                {settings.hotelName}
              </div>
              <div className="text-xs text-white/60">Private Collection</div>
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
          <button
            aria-label="theme"
            className="lux-action rounded-full border border-white/10 p-2 text-white/80 hover:bg-white/8 hover:text-white"
          >
            <Sun size={18} />
          </button>
          <Link
            href="/book"
            onClick={(event) => reloadRoute(event, "/book")}
            className="lux-action hidden md:inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 font-medium text-black shadow-lg shadow-amber-500/25"
          >
            <Phone size={14} /> Book
          </Link>
          <button className="lux-action md:hidden rounded-full border border-white/10 p-2 text-white/80 hover:bg-white/8 hover:text-white">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
