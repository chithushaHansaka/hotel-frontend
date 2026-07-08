"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/settings";

export default function BookingBar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await fetch(API_URL);
        const payload = await response.json().catch(() => null);

        if (!response.ok || !isMounted) {
          return;
        }

        setWhatsappNumber(payload?.data?.whatsappNumber || "");
        setContactPhone(payload?.data?.contactPhone || "");
      } catch {
        // Keep the concierge widget usable with graceful fallbacks.
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Hello, I would like to speak with your concierge team regarding a luxury stay.")}`
    : undefined;

  const phoneHref = contactPhone
    ? `tel:${contactPhone.replace(/\s/g, "")}`
    : undefined;

  if (pathname === "/book" || pathname.includes("book")) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-8 right-6 z-40 flex flex-col items-end gap-3"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="lux-action flex w-[min(22rem,calc(100vw-3rem))] items-center gap-3 rounded-full border border-amber-400/20 bg-black/80 px-4 py-3.5 text-left text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform hover:-translate-y-0.5"
          aria-label={
            isExpanded ? "Minimize concierge widget" : "Open concierge widget"
          }
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <Sparkles size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.32em] text-amber-200/90">
              Digital Concierge
            </div>
            <div className="mt-1 text-[11px] text-white/45 sm:text-xs">
              Private assistance, instantly
            </div>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>

        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full right-0 mb-3 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-[1.5rem] border border-amber-400/15 bg-black/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <div className="space-y-3">
              <p className="text-sm leading-7 text-white/60">
                Connect with our concierge for bespoke reservations, dining, and
                curated experiences.
              </p>

              <a
                href={whatsappHref || "#"}
                target={whatsappHref ? "_blank" : undefined}
                rel={whatsappHref ? "noopener noreferrer" : undefined}
                onClick={(event) => {
                  if (!whatsappHref) {
                    event.preventDefault();
                  }
                }}
                className={`lux-action inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold will-change-transform ${
                  whatsappHref
                    ? "bg-amber-500 text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)]"
                    : "cursor-not-allowed border border-white/10 bg-white/5 text-white/35"
                }`}
              >
                <MessageCircle size={16} />
                Message on WhatsApp
              </a>

              <a
                href={phoneHref || "#"}
                onClick={(event) => {
                  if (!phoneHref) {
                    event.preventDefault();
                  }
                }}
                className={`lux-action inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium will-change-transform ${
                  phoneHref
                    ? "border-amber-400/25 bg-amber-400/10 text-amber-100 hover:border-amber-400/40 hover:text-white"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                }`}
              >
                <Phone size={16} />
                Call Concierge
              </a>
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.aside>
  );
}
