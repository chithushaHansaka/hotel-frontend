"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, CheckCircle2, Eye, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/inquiries";

type BookingType = "room" | "dining" | "offer";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: BookingType;
  contextTitle: string;
};

const baseFields = {
  name: "",
  email: "",
  phone: "",
  guests: "2",
  date: "",
  time: "",
  notes: "",
};

export default function BookingModal({
  isOpen,
  onClose,
  type,
  contextTitle,
}: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState(baseFields);

  const title = useMemo(() => {
    if (type === "room") {
      return `Book ${contextTitle}`;
    }

    if (type === "dining") {
      return `Reserve a table at ${contextTitle}`;
    }

    return `Inquire about ${contextTitle}`;
  }, [contextTitle, type]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError("");
      setFields(baseFields);
    }
  }, [isOpen, type, contextTitle]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleChange =
    (field: keyof typeof fields) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const subjectMap = {
      room: "Room Reservation",
      dining: "Dining Reservation",
      offer: "Offer Inquiry",
    } as const;

    const messageParts = [
      `Type: ${type}`,
      `Context: ${contextTitle}`,
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone}`,
    ];

    if (type === "room") {
      messageParts.push(`Check-in: ${fields.date}`);
      messageParts.push(`Check-out: ${fields.time}`);
      messageParts.push(`Guests: ${fields.guests}`);
    } else if (type === "dining") {
      messageParts.push(`Date: ${fields.date}`);
      messageParts.push(`Time: ${fields.time}`);
      messageParts.push(`Guests: ${fields.guests}`);
    } else {
      messageParts.push(`Preferred Date: ${fields.date}`);
      messageParts.push(`Estimated Guests: ${fields.guests}`);
    }

    if (fields.notes.trim()) {
      messageParts.push("");
      messageParts.push("Notes:");
      messageParts.push(fields.notes.trim());
    }

    const stayDates =
      type === "room"
        ? `${fields.date || "N/A"} to ${fields.time || "N/A"}`
        : type === "offer"
          ? fields.date || "N/A"
          : fields.date || fields.time
            ? `${fields.date || "N/A"}${fields.date && fields.time ? " at " : ""}${fields.time || "N/A"}`
            : "N/A";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          stayDates,
          bookingType: type,
          contextTitle,
          subject: `${subjectMap[type]} - ${contextTitle}`,
          message: messageParts.join("\n"),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to submit inquiry.");
      }

      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit inquiry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0a0a0a] shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,170,94,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_34%)]" />
          <div className="relative border-b border-white/10 p-6 pr-14 sm:p-8 sm:pr-16">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300"
              aria-label="Close booking modal"
            >
              <X size={18} />
            </button>

            <p className="text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
              {type} booking
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              {type === "room"
                ? "Share your dates and guest details, and our team will confirm the stay with tailored luxury service."
                : type === "dining"
                  ? "Reserve your preferred table time and our dining concierge will respond with a personalized confirmation."
                  : "Share the details of your requested experience and our concierge will craft the next steps."}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70">
              <CalendarDays size={12} className="text-amber-300" />
              {contextTitle}
            </div>
          </div>

          <div className="relative p-6 sm:p-8">
            {isSuccess ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <div className="flex h-18 w-18 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="mt-6 text-3xl font-semibold tracking-tight text-white">
                  Request Received
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                  Our concierge team will review your request and get back to
                  you shortly.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="lux-action mt-8 inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 px-5 py-4 text-sm text-amber-100 sm:px-6">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/75">
                    Booking Context
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-amber-50">
                    <Eye size={14} className="text-amber-300" />
                    Booking: {contextTitle}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                      Full Name
                    </span>
                    <input
                      type="text"
                      value={fields.name}
                      onChange={handleChange("name")}
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                      Email
                    </span>
                    <input
                      type="email"
                      value={fields.email}
                      onChange={handleChange("email")}
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                    />
                  </label>
                </div>

                {type === "offer" ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                          Phone
                        </span>
                        <input
                          type="tel"
                          value={fields.phone}
                          onChange={handleChange("phone")}
                          className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                          Estimated Guests
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={fields.guests}
                          onChange={handleChange("guests")}
                          className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                        Preferred Date
                      </span>
                      <input
                        type="date"
                        value={fields.date}
                        onChange={handleChange("date")}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-amber-400 sm:px-5 sm:py-3.5"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                        Event Details & Special Requirements
                      </span>
                      <textarea
                        rows={5}
                        value={fields.notes}
                        onChange={handleChange("notes")}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                          Phone
                        </span>
                        <input
                          type="tel"
                          value={fields.phone}
                          onChange={handleChange("phone")}
                          className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                          Guests
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={fields.guests}
                          onChange={handleChange("guests")}
                          className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {type === "room" ? (
                        <>
                          <label className="block">
                            <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                              Check-in
                            </span>
                            <input
                              type="date"
                              value={fields.date}
                              onChange={handleChange("date")}
                              className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-amber-400 sm:px-5 sm:py-3.5"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                              Check-out
                            </span>
                            <input
                              type="date"
                              value={fields.time}
                              onChange={handleChange("time")}
                              className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-amber-400 sm:px-5 sm:py-3.5"
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <label className="block">
                            <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                              Date
                            </span>
                            <input
                              type="date"
                              value={fields.date}
                              onChange={handleChange("date")}
                              className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-amber-400 sm:px-5 sm:py-3.5"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                              Time
                            </span>
                            <input
                              type="time"
                              value={fields.time}
                              onChange={handleChange("time")}
                              className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-amber-400 sm:px-5 sm:py-3.5"
                            />
                          </label>
                        </>
                      )}
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                        Notes
                      </span>
                      <textarea
                        rows={4}
                        value={fields.notes}
                        onChange={handleChange("notes")}
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400 sm:px-5 sm:py-3.5"
                      />
                    </label>
                  </>
                )}

                {error ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lux-action inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3.5 font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
