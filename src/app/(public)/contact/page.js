"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle, PhoneCall, Send } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/settings";

const defaultSettings = {
  contactEmail: "info@thelux.com",
  contactPhone: "+94 11 234 5678",
  whatsappNumber: "+94 77 123 4567",
  footerAddress: "123 Luxury Avenue, Colombo, Sri Lanka",
};

export default function ContactPage() {
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

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
        // Keep defaults if the settings API is temporarily unavailable.
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.98),_rgba(5,6,8,1))] text-white">
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">
            Concierge contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            At Your Service
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            Reach our hotel team for reservations, dining, events, or any
            tailored stay inquiry.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8"
          >
            {isSent ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <Send size={22} />
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Inquiry Sent Successfully.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                  Our Concierge will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="lux-action mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-white/70">Name</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-amber-300/50"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-white/70">Email</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-amber-300/50"
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="text-sm text-white/70">Subject</span>
                  <select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-amber-300/50">
                    <option className="bg-black">Reservations</option>
                    <option className="bg-black">Dining</option>
                    <option className="bg-black">Events</option>
                    <option className="bg-black">General</option>
                  </select>
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-white/70">Phone</span>
                    <input
                      type="tel"
                      placeholder="+94 11 234 5678"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-amber-300/50"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-white/70">Stay Dates</span>
                    <input
                      type="text"
                      placeholder="Optional"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-amber-300/50"
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="text-sm text-white/70">Message</span>
                  <textarea
                    rows={6}
                    placeholder="Tell us about your stay, event, or request..."
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-amber-300/50"
                  />
                </label>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="lux-action inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8"
          >
            <div className="space-y-8 lg:space-y-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <PhoneCall size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Reservations Phone
                  </h2>
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                    className="mt-2 inline-flex text-sm leading-7 text-white/70 hover:text-amber-300"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Concierge Email
                  </h2>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="mt-2 inline-flex text-sm leading-7 text-white/70 hover:text-amber-300"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    WhatsApp Direct
                  </h2>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/\D+/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm leading-7 text-white/70 hover:text-amber-300"
                  >
                    {settings.whatsappNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Physical Address
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    {settings.footerAddress}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md"
        >
          <div className="relative h-[400px] overflow-hidden p-4 sm:p-5">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.81536309855!2d79.82118585448384!3d6.92183336710499!2m3!1f0!2f0!3f0!2m3!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: "16px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Colombo location map"
            />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
