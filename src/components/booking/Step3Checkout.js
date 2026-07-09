"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/bookings";
const SETTINGS_API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/settings";

const defaultCheckoutSettings = {
  whatsappNumber: "+94 77 123 4567",
  bankDetails: {
    bankName: "Lux Bank",
    accountName: "The Lux Collection",
    accountNumber: "1122334455",
  },
};

const formatLkr = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

const formatUsd = (lkrAmount, usdRate) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format((Number(lkrAmount) || 0) / usdRate);

const formatDate = (value) => {
  if (!value) {
    return "Not selected";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
};

const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  return diff > 0 ? diff : 0;
};

export default function Step3Checkout() {
  const searchParams = useBookingStore((state) => state.searchParams);
  const selectedRooms = useBookingStore((state) => state.selectedRooms);
  const selectedAddons = useBookingStore((state) => state.selectedAddons);
  const guestDetails = useBookingStore((state) => state.guestDetails);
  const setStep = useBookingStore((state) => state.setStep);
  const resetBooking = useBookingStore((state) => state.resetBooking);

  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [slipUploadMessage, setSlipUploadMessage] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [checkoutSettings, setCheckoutSettings] = useState(
    defaultCheckoutSettings,
  );
  const [usdRate, setUsdRate] = useState(300);

  const formatAmount = (amount) =>
    currency === "USD" ? formatUsd(amount, usdRate) : formatLkr(amount);

  useEffect(() => {
    const loadCheckoutSettings = async () => {
      try {
        const response = await fetch(SETTINGS_API_URL);
        const payload = await response.json().catch(() => null);
        const data = payload?.data;

        if (!response.ok || !data) {
          return;
        }

        setCheckoutSettings({
          whatsappNumber:
            data.whatsappNumber || defaultCheckoutSettings.whatsappNumber,
          bankDetails: {
            bankName:
              data.bankDetails?.bankName ||
              defaultCheckoutSettings.bankDetails.bankName,
            accountName:
              data.bankDetails?.accountName ||
              defaultCheckoutSettings.bankDetails.accountName,
            accountNumber:
              data.bankDetails?.accountNumber ||
              defaultCheckoutSettings.bankDetails.accountNumber,
          },
        });
      } catch {
        // Keep checkout defaults if settings are temporarily unavailable.
      }
    };

    const loadUsdRate = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/LKR",
        );
        const data = await response.json().catch(() => null);
        const nextRate = 1 / Number(data?.rates?.USD);

        if (Number.isFinite(nextRate) && nextRate > 0) {
          setUsdRate(nextRate);
        }
      } catch {
        // Keep the fallback rate if the live exchange-rate service is down.
      }
    };

    loadCheckoutSettings();
    loadUsdRate();
  }, []);

  const nights = useMemo(
    () => getNights(searchParams.checkIn, searchParams.checkOut),
    [searchParams.checkIn, searchParams.checkOut],
  );

  const effectiveNights = nights > 0 ? nights : 1;

  const roomLineItems = useMemo(
    () =>
      selectedRooms.map((entry) => ({
        id: entry.roomData.id,
        name: entry.roomData.name,
        price: entry.roomData.price || 0,
        quantity: entry.quantity,
        image: entry.roomData.image,
        lineTotal:
          (entry.roomData.price || 0) * entry.quantity * effectiveNights,
      })),
    [selectedRooms, effectiveNights],
  );

  const roomSubtotal = useMemo(
    () => roomLineItems.reduce((sum, line) => sum + line.lineTotal, 0),
    [roomLineItems],
  );

  const addonsSubtotal = useMemo(
    () => selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0),
    [selectedAddons],
  );

  const subTotal = useMemo(
    () => roomSubtotal + addonsSubtotal,
    [roomSubtotal, addonsSubtotal],
  );

  const serviceCharge = useMemo(() => Math.round(subTotal * 0.1), [subTotal]);

  const vat = useMemo(() => Math.round(subTotal * 0.15), [subTotal]);

  const grandTotal = useMemo(
    () => subTotal + serviceCharge + vat,
    [subTotal, serviceCharge, vat],
  );

  const totalRoomCount = useMemo(
    () => selectedRooms.reduce((sum, entry) => sum + entry.quantity, 0),
    [selectedRooms],
  );

  const handleConfirm = async () => {
    if (selectedRooms.length === 0) {
      setError(
        "Please select at least one room before confirming your reservation.",
      );
      return;
    }

    if (!searchParams.checkIn || !searchParams.checkOut) {
      setError("Please select valid check-in and check-out dates.");
      return;
    }

    setIsConfirming(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest: {
            firstName: guestDetails.firstName.trim(),
            lastName: guestDetails.lastName.trim(),
            email: guestDetails.email.trim(),
            phone: guestDetails.phone.trim(),
            specialRequests: guestDetails.specialRequests.trim(),
          },
          rooms: selectedRooms.map((entry) => ({
            roomId: entry.roomData.id,
            quantity: entry.quantity,
          })),
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          adults: searchParams.adults,
          children: searchParams.children,
          addons: selectedAddons.map((addon) => ({
            name: addon.name,
            price: addon.price,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to confirm reservation.");
      }

      setBookingResult(
        payload?.data
          ? {
              ...payload.data,
              referenceId: payload.data.referenceId || payload.referenceId,
              status: payload.data.status || payload.status,
            }
          : payload,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to confirm reservation.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSlipUpload = async () => {
    if (!selectedSlip) {
      return;
    }

    const referenceId =
      bookingResult?.referenceId ||
      bookingResult?.data?.referenceId ||
      bookingResult?.booking?.referenceId;

    if (!referenceId) {
      setSlipUploadMessage("Booking reference is missing. Please contact us.");
      return;
    }

    setIsUploadingSlip(true);
    setSlipUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("slip", selectedSlip);

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(referenceId)}/slip`,
        {
          method: "PATCH",
          body: formData,
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to upload payment slip.");
      }

      if (payload?.data) {
        setBookingResult(payload.data);
      }

      setSlipUploadMessage("Slip Uploaded Successfully");
      setIsFinished(true);
    } catch (uploadError) {
      setSlipUploadMessage(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload payment slip.",
      );
    } finally {
      setIsUploadingSlip(false);
    }
  };

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="will-change-transform"
      >
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-amber-400/20 bg-amber-400/[0.05] px-8 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/15 text-amber-300 shadow-[0_18px_50px_rgba(212,165,116,0.2)]">
            <CheckCircle2 size={48} />
          </div>
          <p className="mt-8 text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
            Payment Received
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Reservation Secured
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
            Thank you. Your payment slip has been uploaded and is under review
            by our concierge team. We look forward to welcoming you.
          </p>
          <Link
            href="/"
            className="lux-action mt-10 inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] will-change-transform"
          >
            Return to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  if (bookingResult && !isFinished) {
    const referenceId =
      bookingResult.referenceId ||
      bookingResult.data?.referenceId ||
      bookingResult.booking?.referenceId ||
      "Pending";
    const whatsappNumber = checkoutSettings.whatsappNumber.replace(/\D/g, "");
    const whatsappMessage = encodeURIComponent(
      `Hello, here is the payment slip for my booking. Reference ID: ${referenceId}.`,
    );
    const { bankDetails } = checkoutSettings;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="will-change-transform"
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-amber-400/20 bg-black/20 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="border-b border-white/10 bg-amber-400/[0.05] px-6 py-10 text-center sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/15 text-amber-300 shadow-[0_18px_50px_rgba(212,165,116,0.18)]">
              <CheckCircle2 size={40} />
            </div>
            <p className="mt-8 text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
              Next Steps
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Reservation Pending Confirmation
            </h2>
            <div className="mx-auto mt-6 inline-flex max-w-full items-center justify-center rounded-full border border-amber-400/25 bg-black/30 px-5 py-3 text-sm font-semibold text-amber-200 sm:text-base">
              <span className="truncate">Booking Ref: {referenceId}</span>
            </div>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              To secure your reservation, please transfer the advance payment
              within 24 hours.
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.32em] text-amber-300/80">
                Bank Details
              </p>
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-white/45">Bank</p>
                  <p className="mt-1 font-medium text-white">
                    {bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-white/45">Acc Name</p>
                  <p className="mt-1 font-medium text-white">
                    {bankDetails.accountName}
                  </p>
                </div>
                <div>
                  <p className="text-white/45">Acc No</p>
                  <p className="mt-1 font-medium text-white">
                    {bankDetails.accountNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="lux-action inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-amber-500 px-6 py-3.5 text-sm font-semibold text-amber-500 transition-colors hover:bg-amber-500/10 will-change-transform">
                <Upload size={16} />
                Upload Bank Slip
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(event) => {
                    setSelectedSlip(event.target.files?.[0] || null);
                    setSlipUploadMessage("");
                  }}
                />
              </label>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!whatsappNumber}
                className="lux-action inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] will-change-transform"
                onClick={(event) => {
                  if (!whatsappNumber) {
                    event.preventDefault();
                  }
                }}
              >
                <MessageCircle size={17} />
                Send Slip via WhatsApp
              </a>
            </div>

            {selectedSlip ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                      Selected Slip
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {selectedSlip.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSlipUpload}
                    disabled={isUploadingSlip}
                    className="lux-action inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.22)] will-change-transform disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingSlip ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {isUploadingSlip ? "Submitting..." : "Submit Slip"}
                  </button>
                </div>

                {slipUploadMessage ? (
                  <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100">
                    {slipUploadMessage}
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={resetBooking}
              className="lux-action inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-amber-400/40 hover:text-amber-200 will-change-transform"
            >
              Start a New Booking
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="will-change-transform"
    >
      <div className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
          Stage Three
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Review & Checkout
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
          Confirm your curated multi-room itinerary and complete your
          reservation with complete transparency.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="border-b border-white/10 p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.35em] text-amber-200/80">
                Selected Residences
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {totalRoomCount} Room{totalRoomCount !== 1 ? "s" : ""} ·{" "}
                {selectedRooms.length} Type
                {selectedRooms.length !== 1 ? "s" : ""}
              </h3>
            </div>

            <div className="space-y-4 p-6 sm:p-8">
              {roomLineItems.map((line) => (
                <div
                  key={line.id}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  {line.image ? (
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={line.image}
                        alt={line.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-white">
                      {line.name}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {formatAmount(line.price)} × {line.quantity} room
                      {line.quantity !== 1 ? "s" : ""} × {effectiveNights} night
                      {effectiveNights !== 1 ? "s" : ""}
                    </p>
                    <p className="mt-2 text-sm font-medium text-amber-200">
                      {formatAmount(line.lineTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-2 sm:p-8">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
                  <CalendarDays size={12} className="text-amber-300" />
                  Stay Dates
                </div>
                <p className="mt-3 text-sm text-white/85">
                  {formatDate(searchParams.checkIn)}
                </p>
                <p className="mt-1 text-xs text-white/45">to</p>
                <p className="mt-1 text-sm text-white/85">
                  {formatDate(searchParams.checkOut)}
                </p>
                <p className="mt-3 text-xs text-amber-200/80">
                  {effectiveNights} night{effectiveNights !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
                  <User size={12} className="text-amber-300" />
                  Guests
                </div>
                <p className="mt-3 text-sm text-white/85">
                  {searchParams.adults} Adult
                  {searchParams.adults !== 1 ? "s" : ""}
                </p>
                {searchParams.children > 0 ? (
                  <p className="mt-1 text-sm text-white/85">
                    {searchParams.children} Child
                    {searchParams.children !== 1 ? "ren" : ""}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
              Guest Profile
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                  Name
                </p>
                <p className="mt-2 text-sm text-white/85">
                  {guestDetails.firstName} {guestDetails.lastName}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                  Contact
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <Mail size={14} className="text-amber-300" />
                  {guestDetails.email}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <Phone size={14} className="text-amber-300" />
                  {guestDetails.phone}
                </p>
              </div>
            </div>

            {guestDetails.specialRequests ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                  Special Requests
                </p>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  {guestDetails.specialRequests}
                </p>
              </div>
            ) : null}
          </div>

          {selectedAddons.length > 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-300" />
                <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
                  Enhancements
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {selectedAddons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {addon.name}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {addon.category}
                      </p>
                    </div>
                    <p className="text-sm text-amber-200">
                      {formatAmount(addon.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <aside className="relative h-fit rounded-[2rem] border border-amber-400/15 bg-[#0a0a0a] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
                Invoice Summary
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                Total Breakdown
              </h3>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 p-1.5">
            <span className="pl-3 text-[10px] uppercase tracking-[0.28em] text-white/45">
              Display Currency
            </span>
            <div className="relative inline-flex rounded-full border border-white/10 bg-black/40 p-1 will-change-transform">
              {["LKR", "USD"].map((option) => {
                const isActive = currency === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCurrency(option)}
                    className={`relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors ${
                      isActive
                        ? "text-black"
                        : "text-white/55 hover:text-white/80"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="checkout-currency-pill"
                        className="absolute inset-0 rounded-full bg-amber-500 shadow-[0_8px_24px_rgba(212,165,116,0.28)]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    ) : null}
                    <span className="relative z-10">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 space-y-4 border-b border-white/10 pb-6">
            {roomLineItems.map((line) => (
              <div
                key={line.id}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-white/80">
                    {line.name}
                    {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {formatAmount(line.price)} × {line.quantity} ×{" "}
                    {effectiveNights} night{effectiveNights !== 1 ? "s" : ""}
                  </p>
                </div>
                <p className="text-sm font-medium text-white">
                  {formatAmount(line.lineTotal)}
                </p>
              </div>
            ))}

            {selectedAddons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between gap-4"
              >
                <p className="text-sm text-white/80">{addon.name}</p>
                <p className="text-sm font-medium text-white">
                  {formatAmount(addon.price)}
                </p>
              </div>
            ))}

            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <p className="text-sm font-medium text-white/80">Subtotal</p>
              <p className="text-sm font-medium text-white">
                {formatAmount(subTotal)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/55">Service Charge (10%)</p>
              <p className="text-sm font-medium text-white">
                {formatAmount(serviceCharge)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/55">VAT (15%)</p>
              <p className="text-sm font-medium text-white">
                {formatAmount(vat)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
                Grand Total
              </p>
              <motion.p
                key={currency}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-2 text-3xl font-semibold tracking-tight text-amber-200 will-change-transform"
              >
                {formatAmount(grandTotal)}
              </motion.p>
            </div>
            <p className="text-xs text-white/45">
              {currency === "USD"
                ? `Approx. USD · 1 USD = ${Math.round(usdRate)} LKR`
                : "All taxes included"}
            </p>
          </div>

          <p className="mt-6 text-xs leading-6 text-white/45">
            By confirming, you authorize our concierge team to finalize your
            reservation and contact you with payment instructions. All charges
            are processed in LKR on the backend.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming || selectedRooms.length === 0}
              className="lux-action inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] will-change-transform disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConfirming ? "Confirming..." : "Confirm Reservation"}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isConfirming}
              className="lux-action inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-amber-400/40 hover:text-amber-200 will-change-transform disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Back to Details
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
