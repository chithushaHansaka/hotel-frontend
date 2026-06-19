"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Camera,
  Globe,
  Mail,
  MapPin,
  PhoneCall,
  Send,
  MessageCircle,
} from "lucide-react";
import { reloadRoute } from "../lib/reloadNavigation";

const API_URL = "http://localhost:5000/api/settings";

type SiteSettings = {
  hotelName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  footerAddress: string;
};

const defaultSettings: SiteSettings = {
  hotelName: "THE LUX",
  contactEmail: "info@thelux.com",
  contactPhone: "+94 11 234 5678",
  whatsappNumber: "+94 77 123 4567",
  footerAddress: "123 Luxury Avenue, Colombo, Sri Lanka",
};

const exploreLinks = [
  ["Home", "/"],
  ["Rooms & Suites", "/rooms"],
  ["Dining", "/dining"],
  ["Gallery", "/gallery"],
  ["Experiences", "/offers"],
  ["Contact", "/contact"],
];

const socialLinks = [
  [Camera, "https://instagram.com"],
  [Globe, "https://facebook.com"],
  [Send, "https://x.com"],
  [MessageCircle, "https://linkedin.com"],
];

export default function Footer() {
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
            contactEmail:
              payload?.data?.contactEmail || defaultSettings.contactEmail,
            contactPhone:
              payload?.data?.contactPhone || defaultSettings.contactPhone,
            whatsappNumber:
              payload?.data?.whatsappNumber || defaultSettings.whatsappNumber,
            footerAddress:
              payload?.data?.footerAddress || defaultSettings.footerAddress,
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

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-zinc-950 to-black text-white">
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm font-semibold tracking-[0.45em] text-amber-300">
              {settings.hotelName}
            </div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-zinc-400">
              A legacy shaped by hospitality, crafted for the modern
              connoisseur. Experience timeless elegance in the heart of Colombo.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(([Icon, href]) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors duration-300 hover:scale-110 hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-500 transition-transform"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-xs uppercase tracking-[0.2em] text-zinc-500">
              Explore
            </h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              {exploreLinks.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={(event) => reloadRoute(event, href)}
                    className="relative inline-block text-zinc-400 transition-colors duration-300 hover:text-amber-500 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-amber-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-xs uppercase tracking-[0.2em] text-zinc-500">
              Contact
            </h3>
            <div className="space-y-4 text-sm text-zinc-400">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-amber-300" size={16} />
                <p>{settings.footerAddress}</p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 shrink-0 text-amber-300" size={16} />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-zinc-400 transition-colors duration-300 hover:text-amber-500"
                >
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <PhoneCall
                  className="mt-0.5 shrink-0 text-amber-300"
                  size={16}
                />
                <a
                  href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                  className="text-zinc-400 transition-colors duration-300 hover:text-amber-500"
                >
                  {settings.contactPhone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle
                  className="mt-0.5 shrink-0 text-amber-300"
                  size={16}
                />
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D+/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 transition-colors duration-300 hover:text-amber-500"
                >
                  {settings.whatsappNumber}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-xs uppercase tracking-[0.2em] text-zinc-500">
              Newsletter
            </h3>
            <p className="max-w-sm text-sm leading-7 text-zinc-400">
              Receive curated updates on offers, dining moments, and seasonal
              experiences.
            </p>
            <form className="mt-5">
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full border-b border-zinc-800 bg-transparent py-2 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors duration-300 hover:border-amber-500 hover:text-amber-500"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-center border-t border-white/10 pt-6 text-center">
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} {settings.hotelName} Hotel. All rights
            reserved.
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-600">
            <a
              href="#"
              className="transition-colors duration-300 hover:text-amber-500 hover:underline hover:decoration-amber-500 hover:underline-offset-4"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors duration-300 hover:text-amber-500 hover:underline hover:decoration-amber-500 hover:underline-offset-4"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="transition-colors duration-300 hover:text-amber-500 hover:underline hover:decoration-amber-500 hover:underline-offset-4"
            >
              Cookie Policy
            </a>
            <a
              href="#"
              className="transition-colors duration-300 hover:text-amber-500 hover:underline hover:decoration-amber-500 hover:underline-offset-4"
            >
              Cancellation Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
