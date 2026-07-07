"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Clock3,
  Mail,
  MessageSquareText,
  Trash2,
  User,
} from "lucide-react";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/inquiries";

type Inquiry = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  stayDates?: string;
  contextTitle?: string;
  bookingType?: string;
  createdAt: string;
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [expandedInquiryId, setExpandedInquiryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadInquiries = async () => {
      try {
        const token = window.localStorage.getItem("hotel_admin_token");

        if (!token) {
          throw new Error("Missing admin token. Please sign in again.");
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load inquiries.");
        }

        if (isMounted) {
          setInquiries(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load inquiries.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInquiries();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalInquiries = useMemo(() => inquiries.length, [inquiries.length]);

  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      const token = window.localStorage.getItem("hotel_admin_token");

      if (!token) {
        throw new Error("Missing admin token. Please sign in again.");
      }

      setDeletingId(inquiryId);

      const response = await fetch(`${API_URL}/${inquiryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete inquiry.");
      }

      setInquiries((current) =>
        current.filter((item) => item._id !== inquiryId),
      );
      setExpandedInquiryId((current) =>
        current === inquiryId ? null : current,
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete inquiry.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const toggleInquiry = (inquiryId: string) => {
    setExpandedInquiryId((current) =>
      current === inquiryId ? null : inquiryId,
    );
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.34em] text-amber-200/80">
            Concierge Inbox
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Guest inquiries and booking requests
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            Review every reservation request in one protected luxury dashboard.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Total Inquiries", String(totalInquiries)],
          [
            "Latest Queue",
            inquiries[0]
              ? new Date(inquiries[0].createdAt).toLocaleDateString()
              : "None",
          ],
          ["Response Status", "Awaiting concierge review"],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-white/45">
              {label}
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
              {value}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/40">
              Admin List
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {isLoading ? "Loading inquiries..." : "Recent guest requests"}
            </h3>
          </div>
          <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-amber-100">
            Live
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center text-white/60">
            No inquiries found.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {inquiries.map((inquiry) => (
              <article
                key={inquiry._id}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-stretch gap-2 px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => toggleInquiry(inquiry._id)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left transition-colors hover:bg-white/5"
                    aria-expanded={expandedInquiryId === inquiry._id}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-amber-200/80">
                        <Clock3 size={12} />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </div>

                      <div className="min-w-0 text-lg font-semibold text-white">
                        {inquiry.name}
                      </div>

                      <div className="inline-flex w-fit items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-100">
                        {inquiry.bookingType || "General"}
                      </div>

                      <div className="min-w-0 truncate text-sm text-white/70 lg:ml-auto lg:max-w-[22rem]">
                        {inquiry.contextTitle
                          ? `${inquiry.contextTitle} · ${inquiry.subject}`
                          : inquiry.subject}
                      </div>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70">
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          expandedInquiryId === inquiry._id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteInquiry(inquiry._id);
                    }}
                    disabled={deletingId === inquiry._id}
                    aria-label={`Delete inquiry from ${inquiry.name}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-100 transition hover:bg-rose-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    expandedInquiryId === inquiry._id
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/45">
                            <User size={12} />
                            Contact
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-white/78">
                            <div>{inquiry.email}</div>
                            {inquiry.stayDates ? (
                              <div className="text-white/55">
                                Stay Dates: {inquiry.stayDates}
                              </div>
                            ) : null}
                            {inquiry.bookingType ? (
                              <div className="text-white/55">
                                Context: {inquiry.bookingType}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/45">
                            <Mail size={12} />
                            Subject
                          </div>
                          <p className="mt-3 text-sm leading-6 text-white/78">
                            {inquiry.contextTitle
                              ? `${inquiry.contextTitle} · ${inquiry.subject}`
                              : inquiry.subject}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/45">
                          <MessageSquareText size={12} />
                          Message
                        </div>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/70">
                          {inquiry.message}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inquiry._id)}
                          disabled={deletingId === inquiry._id}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-rose-100 transition hover:bg-rose-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={12} />
                          {deletingId === inquiry._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
