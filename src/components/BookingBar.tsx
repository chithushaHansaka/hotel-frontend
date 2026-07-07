"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/settings";

export default function BookingBar() {
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

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50 w-[20rem] overflow-hidden rounded-[1.75rem] border border-amber-400/15 bg-black/70 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl will-change-transform sm:w-[22rem]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,165,116,0.14),transparent_55%)]" />

      <div className="relative p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-amber-200/90">
                Digital Concierge
              </div>
              <div className="text-[11px] text-white/45">
                Private assistance, instantly
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300"
            aria-label={
              isExpanded
                ? "Minimize concierge widget"
                : "Expand concierge widget"
            }
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-3"
          >
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
          </motion.div>
        ) : null}
      </div>
    </motion.aside>
  );
}
