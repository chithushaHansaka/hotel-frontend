"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Clock3,
  Crown,
  ExternalLink,
  FileText,
  Filter,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";

const BOOKINGS_API =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/bookings";
const INQUIRIES_API =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/inquiries";
const DASHBOARD_HIDE_DAYS = 7;

const TABS = [
  { id: "reservations", label: "Suite Reservations" },
  { id: "inquiries", label: "Concierge Requests" },
];

const BOOKING_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "CheckedIn", label: "Checked-In" },
  { value: "CheckedOut", label: "Checked-Out" },
  { value: "Cancelled", label: "Cancelled" },
];

const INQUIRY_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Resolved", label: "Resolved" },
];

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return "—";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(checkIn))} – ${formatter.format(new Date(checkOut))}`;
};

const formatCreatedAt = (value) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  return diff > 0 ? diff : 0;
};

const getBookingReference = (booking) =>
  booking.referenceId || booking._id.slice(-8).toUpperCase();

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const bookingOverlapsDate = (booking, dateStr) => {
  if (!dateStr) {
    return true;
  }

  const target = startOfDay(`${dateStr}T12:00:00`);
  const checkIn = startOfDay(booking.checkIn);
  const checkOut = startOfDay(booking.checkOut);

  return checkIn <= target && checkOut > target;
};

const isWithinDashboardWindow = (booking) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DASHBOARD_HIDE_DAYS);
  cutoff.setHours(0, 0, 0, 0);

  const checkOut = startOfDay(booking.checkOut);

  return checkOut >= cutoff;
};

const getCompactRoomsSummary = (rooms = []) => {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return "—";
  }

  if (rooms.length === 1) {
    const line = rooms[0];
    const name = line.room?.name || "Residence";
    const quantity = line.quantity || 1;
    return quantity > 1 ? `${quantity}x ${name}` : name;
  }

  const firstName = rooms[0].room?.name || "Residence";
  const totalRooms = rooms.reduce((sum, line) => sum + (line.quantity || 1), 0);

  return `${rooms.length} Room Types · ${totalRooms} suites · ${firstName}…`;
};

const getBookingRoomNames = (booking) => {
  if (!Array.isArray(booking?.rooms)) {
    return "";
  }

  return booking.rooms
    .map((line) => line.room?.name || "")
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const bookingHasRoomType = (booking, roomTypeId) => {
  if (!roomTypeId) {
    return true;
  }

  return (booking.rooms || []).some(
    (line) => String(line.room?._id) === String(roomTypeId),
  );
};

const getBookingStatusStyles = (status) => {
  switch (status) {
    case "Confirmed":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100";
    case "CheckedIn":
      return "border-sky-400/25 bg-sky-400/10 text-sky-100";
    case "CheckedOut":
      return "border-violet-400/25 bg-violet-400/10 text-violet-100";
    case "Cancelled":
      return "border-rose-400/25 bg-rose-400/10 text-rose-100";
    default:
      return "border-amber-400/25 bg-amber-400/10 text-amber-100";
  }
};

const getInquiryStatusStyles = (status) => {
  switch (status) {
    case "Resolved":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100";
    default:
      return "border-amber-400/25 bg-amber-400/10 text-amber-100";
  }
};

const filterInputClass =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] placeholder:text-white/35 focus:border-amber-400/50";

function AdminTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-black/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors will-change-transform ${
              isActive ? "text-black" : "text-white/60 hover:text-white/85"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="reservations-concierge-tab"
                className="absolute inset-0 rounded-full bg-amber-500 shadow-[0_10px_30px_rgba(212,165,116,0.28)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BookingExpandedPanel({ booking }) {
  const nights = getNights(booking.checkIn, booking.checkOut) || 1;
  const serviceCharge = booking.taxes?.serviceCharge ?? 0;
  const vat = booking.taxes?.vat ?? 0;
  const subTotal = booking.subTotal ?? 0;
  const grandTotal = booking.grandTotal || booking.totalAmount || 0;
  const bookingReference = getBookingReference(booking);

  const roomLines = (booking.rooms || []).map((line) => ({
    id: `${line.room?._id || line.room}-${line.quantity}`,
    name: line.room?.name || "Residence",
    price: line.room?.price || 0,
    quantity: line.quantity || 1,
    lineTotal: (line.room?.price || 0) * (line.quantity || 1) * nights,
  }));

  const addonsTotal = (booking.addons || []).reduce(
    (sum, addon) => sum + (addon.price || 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="overflow-hidden border-t border-amber-400/10 bg-gradient-to-b from-amber-400/[0.04] to-black/20"
    >
      <div className="px-4 py-5 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
              <User size={12} />
              Guest Details
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <p className="font-medium text-white">
                {booking.guest?.firstName} {booking.guest?.lastName}
              </p>
              <p className="font-mono text-xs text-amber-200/80">
                {bookingReference}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-amber-300" />
                {booking.guest?.email || "—"}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-amber-300" />
                {booking.guest?.phone || "—"}
              </p>
              <p className="text-xs text-white/50">
                Booked {formatCreatedAt(booking.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
              <CalendarDays size={12} />
              Stay Window
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <p className="font-medium text-white">
                {formatDateRange(booking.checkIn, booking.checkOut)}
              </p>
              <p className="text-xs text-white/50">
                {nights} night{nights !== 1 ? "s" : ""} reserved
              </p>
              <p className="text-xs text-white/50">
                Check-in:{" "}
                {booking.checkIn ? formatCreatedAt(booking.checkIn) : "—"}
              </p>
              <p className="text-xs text-white/50">
                Check-out:{" "}
                {booking.checkOut ? formatCreatedAt(booking.checkOut) : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
              <BedDouble size={12} />
              Full Room List
            </div>
            <div className="mt-3 space-y-2">
              {roomLines.length > 0 ? (
                roomLines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {line.quantity}x {line.name}
                      </p>
                      <p className="text-xs text-white/45">
                        {formatPrice(line.price)} × {nights} night
                        {nights !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-sm text-amber-200">
                      {formatPrice(line.lineTotal)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/45">No rooms recorded.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
              <Sparkles size={12} />
              Price Breakdown
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between py-1 text-white/75">
                <span>Rooms</span>
                <span>{formatPrice(subTotal - addonsTotal)}</span>
              </div>
              {(booking.addons || []).map((addon, index) => (
                <div
                  key={`${addon.name}-${index}`}
                  className="flex items-center justify-between py-1 text-white/75"
                >
                  <span>{addon.name}</span>
                  <span>{formatPrice(addon.price)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/10 py-1.5 text-white/85">
                <span>Subtotal</span>
                <span>{formatPrice(subTotal)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-white/55">
                <span>Service Charge (10%)</span>
                <span>{formatPrice(serviceCharge)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-white/55">
                <span>VAT (15%)</span>
                <span>{formatPrice(vat)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 font-semibold text-amber-200">
                <span>Grand Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {booking.guest?.specialRequests ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
              <MessageSquareText size={12} />
              Special Requests
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/70">
              {booking.guest.specialRequests}
            </p>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
            <FileText size={12} />
            Payment Verification
          </div>
          {booking.paymentSlipUrl ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-white/70">
                A guest payment slip has been uploaded for this reservation.
              </p>
              <a
                href={booking.paymentSlipUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black shadow-[0_14px_36px_rgba(212,165,116,0.22)] transition hover:bg-amber-400"
              >
                <ExternalLink size={14} />
                View Uploaded Bank Slip
              </a>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-white/55">
              No slip uploaded yet.
            </p>
          )}
        </div>

        {(booking.addons || []).length > 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
              <Sparkles size={12} />
              Add-ons Selected
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {booking.addons.map((addon, index) => (
                <span
                  key={`${addon.name}-${index}`}
                  className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100"
                >
                  {addon.name} · {formatPrice(addon.price)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

const getInquiryType = (inquiry) =>
  inquiry.bookingType ||
  inquiry.contextType ||
  inquiry.contextTitle ||
  "General";

function InquiryExpandedPanel({ inquiry }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="overflow-hidden border-t border-amber-400/10 bg-gradient-to-b from-amber-400/[0.04] to-black/20"
    >
      <div className="px-4 py-5 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
              <User size={12} />
              Guest Contact
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <p className="font-medium text-white">{inquiry.name || "—"}</p>
              <p className="flex items-center gap-2 break-all">
                <Mail size={13} className="shrink-0 text-amber-300" />
                {inquiry.email || "—"}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-amber-300" />
                {inquiry.phone || "—"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
              <Mail size={12} />
              Subject
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <p className="font-medium text-white">
                {inquiry.subject || "No subject provided"}
              </p>
              {inquiry.contextTitle ? (
                <p className="text-xs leading-5 text-white/50">
                  Related to {inquiry.contextTitle}
                </p>
              ) : null}
              {inquiry.stayDates ? (
                <p className="text-xs leading-5 text-white/50">
                  Stay Dates: {inquiry.stayDates}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
              <Clock3 size={12} />
              Request Timeline
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <p className="font-medium text-white">
                Created {formatCreatedAt(inquiry.createdAt)}
              </p>
              <p className="text-xs text-white/50">
                Type: {getInquiryType(inquiry)}
              </p>
              <p className="text-xs text-white/50">
                Status: {inquiry.status || "Pending"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
            <MessageSquareText size={12} />
            Full Inquiry Message
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/72">
            {inquiry.message || "No message provided."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReservationsConciergePage() {
  const [activeTab, setActiveTab] = useState("reservations");
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterRoomType, setFilterRoomType] = useState("");
  const [updatingBookingId, setUpdatingBookingId] = useState("");
  const [deletingBookingId, setDeletingBookingId] = useState("");
  const [updatingInquiryId, setUpdatingInquiryId] = useState("");
  const [deletingInquiryId, setDeletingInquiryId] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [expandedInquiryId, setExpandedInquiryId] = useState(null);

  const getToken = () => {
    const token = window.localStorage.getItem("hotel_admin_token");

    if (!token) {
      throw new Error("Missing admin token. Please sign in again.");
    }

    return token;
  };

  const loadBookings = async () => {
    try {
      setError("");
      const response = await fetch(BOOKINGS_API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load bookings.");
      }

      setBookings(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load bookings.",
      );
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const loadInquiries = async () => {
    try {
      setError("");
      const response = await fetch(INQUIRIES_API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load inquiries.");
      }

      setInquiries(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load inquiries.",
      );
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const refreshAll = async () => {
    setIsLoadingBookings(true);
    setIsLoadingInquiries(true);
    await Promise.all([loadBookings(), loadInquiries()]);
  };

  useEffect(() => {
    loadBookings();
    loadInquiries();
  }, []);

  const roomTypeOptions = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      (booking.rooms || []).forEach((line) => {
        if (line.room?._id && line.room?.name) {
          map.set(String(line.room._id), line.room.name);
        }
      });
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || filterDate || filterRoomType,
  );

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (!hasActiveFilters && !isWithinDashboardWindow(booking)) {
        return false;
      }

      if (filterDate && !bookingOverlapsDate(booking, filterDate)) {
        return false;
      }

      if (!bookingHasRoomType(booking, filterRoomType)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const guestName =
        `${booking.guest?.firstName || ""} ${booking.guest?.lastName || ""}`.toLowerCase();
      const roomNames = getBookingRoomNames(booking);
      const bookingReference = getBookingReference(booking).toLowerCase();

      return (
        guestName.includes(query) ||
        roomNames.includes(query) ||
        getCompactRoomsSummary(booking.rooms).toLowerCase().includes(query) ||
        bookingReference.includes(query) ||
        booking._id?.toLowerCase().includes(query) ||
        booking.guest?.email?.toLowerCase().includes(query)
      );
    });
  }, [bookings, searchQuery, filterDate, filterRoomType, hasActiveFilters]);

  const hiddenPastCount = useMemo(() => {
    if (hasActiveFilters) {
      return 0;
    }

    return bookings.filter((booking) => !isWithinDashboardWindow(booking))
      .length;
  }, [bookings, hasActiveFilters]);

  const filteredInquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return inquiries;
    }

    return inquiries.filter((inquiry) => {
      return (
        inquiry.name?.toLowerCase().includes(query) ||
        inquiry.email?.toLowerCase().includes(query) ||
        inquiry.subject?.toLowerCase().includes(query) ||
        inquiry.contextTitle?.toLowerCase().includes(query) ||
        inquiry.bookingType?.toLowerCase().includes(query)
      );
    });
  }, [inquiries, searchQuery]);

  const stats = useMemo(
    () => ({
      bookings: hasActiveFilters
        ? filteredBookings.length
        : bookings.filter(isWithinDashboardWindow).length,
      pendingBookings: filteredBookings.filter(
        (item) => item.bookingStatus === "Pending",
      ).length,
      inquiries: inquiries.length,
      pendingInquiries: inquiries.filter((item) => item.status !== "Resolved")
        .length,
      revenue: filteredBookings
        .filter((item) => item.bookingStatus !== "Cancelled")
        .reduce(
          (sum, item) => sum + (item.grandTotal || item.totalAmount || 0),
          0,
        ),
    }),
    [bookings, filteredBookings, inquiries, hasActiveFilters],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setFilterDate("");
    setFilterRoomType("");
  };

  const handleBookingStatusChange = async (bookingId, bookingStatus) => {
    try {
      setUpdatingBookingId(bookingId);
      setError("");

      const response = await fetch(`${BOOKINGS_API}/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ bookingStatus }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update booking status.");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? { ...booking, ...payload.data } : booking,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update booking status.",
      );
    } finally {
      setUpdatingBookingId("");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Delete this reservation permanently? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeletingBookingId(bookingId);
      setError("");

      const response = await fetch(`${BOOKINGS_API}/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete booking.");
      }

      setBookings((current) =>
        current.filter((item) => item._id !== bookingId),
      );
      setExpandedBookingId((current) =>
        current === bookingId ? null : current,
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete booking.",
      );
    } finally {
      setDeletingBookingId("");
    }
  };

  const handleInquiryStatusChange = async (inquiryId, status) => {
    try {
      setUpdatingInquiryId(inquiryId);
      setError("");

      const response = await fetch(`${INQUIRIES_API}/${inquiryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update inquiry status.");
      }

      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry._id === inquiryId
            ? { ...inquiry, status: payload.data.status }
            : inquiry,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update inquiry status.",
      );
    } finally {
      setUpdatingInquiryId("");
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    try {
      setDeletingInquiryId(inquiryId);
      setError("");

      const response = await fetch(`${INQUIRIES_API}/${inquiryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
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
      setDeletingInquiryId("");
    }
  };

  const isLoading =
    activeTab === "reservations" ? isLoadingBookings : isLoadingInquiries;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-amber-200/90">
              <Crown size={14} />
              Concierge Operations
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Reservations & Concierge
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Oversee active suite reservations and guest concierge requests
              from a single luxury operations desk.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            className="lux-action inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 hover:border-amber-400/30 hover:text-amber-100"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Active Reservations", value: stats.bookings },
            { label: "Pending Stays", value: stats.pendingBookings },
            { label: "Open Requests", value: stats.pendingInquiries },
            { label: "Filtered Revenue", value: formatPrice(stats.revenue) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                {item.label}
              </div>
              <div className="mt-3 text-2xl font-semibold text-amber-100">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <AdminTabs
              tabs={TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <label className="relative block w-full max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  activeTab === "reservations"
                    ? "Search guest, suite, or booking ID..."
                    : "Search guest, subject, or request type..."
                }
                className="w-full rounded-2xl border border-white/10 bg-black/35 py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-400/50"
              />
            </label>
          </div>

          {activeTab === "reservations" ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
                <Filter size={12} className="text-amber-300" />
                Advanced Filters
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-white/55">
                    Stay Date (overlap)
                  </span>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(event) => setFilterDate(event.target.value)}
                    className={filterInputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-white/55">
                    Room Type
                  </span>
                  <select
                    value={filterRoomType}
                    onChange={(event) => setFilterRoomType(event.target.value)}
                    className={filterInputClass}
                  >
                    <option value="" className="bg-zinc-950">
                      All Room Types
                    </option>
                    {roomTypeOptions.map((room) => (
                      <option
                        key={room.id}
                        value={room.id}
                        className="bg-zinc-950"
                      >
                        {room.name}
                      </option>
                    ))}
                  </select>
                </label>

                {hasActiveFilters ? (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-amber-400/30 hover:text-amber-100"
                    >
                      <X size={14} />
                      Clear Filters
                    </button>
                  </div>
                ) : null}
              </div>

              {!hasActiveFilters && hiddenPastCount > 0 ? (
                <p className="mt-3 text-xs leading-6 text-white/45">
                  Showing active reservations only (checkout within the last{" "}
                  {DASHBOARD_HIDE_DAYS} days).{" "}
                  <span className="text-amber-200/80">
                    {hiddenPastCount} archived
                  </span>{" "}
                  booking{hiddenPastCount !== 1 ? "s" : ""} hidden — apply
                  filters to view historical records.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mx-6 mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 sm:mx-8">
            {error}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {activeTab === "reservations" ? (
            <motion.div
              key="reservations"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="will-change-transform"
            >
              {isLoading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-12 animate-pulse rounded-xl border border-white/10 bg-white/5"
                    />
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-10 text-center text-white/55">
                  No reservations match your current view.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.24em] text-white/45">
                        <th className="px-4 py-4 font-medium sm:px-6" />
                        <th className="px-4 py-4 font-medium sm:px-6">ID</th>
                        <th className="px-4 py-4 font-medium sm:px-6">Guest</th>
                        <th className="px-4 py-4 font-medium sm:px-6">
                          Suites
                        </th>
                        <th className="px-4 py-4 font-medium sm:px-6">Total</th>
                        <th className="px-4 py-4 font-medium sm:px-6">
                          Status
                        </th>
                        <th className="px-4 py-4 font-medium sm:px-6" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const guestName =
                          `${booking.guest?.firstName || ""} ${booking.guest?.lastName || ""}`.trim();
                        const total =
                          booking.grandTotal || booking.totalAmount || 0;
                        const isExpanded = expandedBookingId === booking._id;
                        const compactRooms = getCompactRoomsSummary(
                          booking.rooms,
                        );
                        const bookingReference = getBookingReference(booking);

                        return (
                          <Fragment key={booking._id}>
                            <tr
                              className={`border-b border-white/8 transition-colors ${
                                isExpanded
                                  ? "bg-white/[0.04]"
                                  : "hover:bg-white/[0.02]"
                              }`}
                            >
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedBookingId((current) =>
                                      current === booking._id
                                        ? null
                                        : booking._id,
                                    )
                                  }
                                  aria-label="Expand booking details"
                                  aria-expanded={isExpanded}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/70 transition hover:border-amber-400/30 hover:text-amber-200"
                                >
                                  <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-300 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              </td>
                              <td className="px-4 py-5 align-middle font-mono text-[11px] text-amber-200/85 sm:px-6">
                                {bookingReference}
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedBookingId((current) =>
                                      current === booking._id
                                        ? null
                                        : booking._id,
                                    )
                                  }
                                  className="max-w-[160px] truncate text-left font-medium text-white hover:text-amber-100"
                                >
                                  {guestName || "—"}
                                </button>
                                <p className="max-w-[160px] truncate text-[11px] text-white/40">
                                  {booking.guest?.email || "—"}
                                </p>
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <p className="max-w-[180px] truncate text-xs text-white/80">
                                  {compactRooms}
                                </p>
                              </td>
                              <td className="px-4 py-5 align-middle text-sm font-medium text-amber-100 sm:px-6">
                                {formatPrice(total)}
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <select
                                  value={booking.bookingStatus}
                                  disabled={updatingBookingId === booking._id}
                                  onChange={(event) =>
                                    handleBookingStatusChange(
                                      booking._id,
                                      event.target.value,
                                    )
                                  }
                                  className={`w-full min-w-[120px] rounded-lg border px-2 py-1.5 text-xs outline-none [color-scheme:dark] focus:border-amber-400/50 disabled:opacity-60 ${getBookingStatusStyles(booking.bookingStatus)}`}
                                >
                                  {BOOKING_STATUS_OPTIONS.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                      className="bg-zinc-950 text-white"
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteBooking(booking._id)
                                  }
                                  disabled={deletingBookingId === booking._id}
                                  aria-label={`Delete booking ${bookingReference}`}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-100 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>

                            {isExpanded ? (
                              <tr className="border-b border-white/8">
                                <td colSpan={7} className="p-0">
                                  <BookingExpandedPanel booking={booking} />
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inquiries"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="will-change-transform"
            >
              {isLoading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/5"
                    />
                  ))}
                </div>
              ) : filteredInquiries.length === 0 ? (
                <div className="p-10 text-center text-white/55">
                  No concierge requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.24em] text-white/45">
                        <th className="px-4 py-4 font-medium sm:px-6" />
                        <th className="px-4 py-4 font-medium sm:px-6">ID</th>
                        <th className="px-4 py-4 font-medium sm:px-6">
                          Guest Name
                        </th>
                        <th className="px-4 py-4 font-medium sm:px-6">
                          Inquiry Type
                        </th>
                        <th className="px-4 py-4 font-medium sm:px-6">
                          Created Date
                        </th>
                        <th className="px-4 py-4 font-medium sm:px-6">
                          Status
                        </th>
                        <th className="px-4 py-4 font-medium sm:px-6" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInquiries.map((inquiry) => {
                        const isExpanded = expandedInquiryId === inquiry._id;
                        const inquiryType = getInquiryType(inquiry);

                        return (
                          <Fragment key={inquiry._id}>
                            <tr
                              className={`border-b border-white/8 transition-colors ${
                                isExpanded
                                  ? "bg-white/[0.04]"
                                  : "hover:bg-white/[0.02]"
                              }`}
                            >
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedInquiryId((current) =>
                                      current === inquiry._id
                                        ? null
                                        : inquiry._id,
                                    )
                                  }
                                  aria-label="Expand inquiry details"
                                  aria-expanded={isExpanded}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/70 transition hover:border-amber-400/30 hover:text-amber-200"
                                >
                                  <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-300 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              </td>
                              <td className="px-4 py-5 align-middle font-mono text-[11px] text-amber-200/85 sm:px-6">
                                {inquiry._id.slice(-8).toUpperCase()}
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedInquiryId((current) =>
                                      current === inquiry._id
                                        ? null
                                        : inquiry._id,
                                    )
                                  }
                                  className="max-w-[180px] truncate text-left font-medium text-white hover:text-amber-100"
                                >
                                  {inquiry.name || "—"}
                                </button>
                                <p className="max-w-[180px] truncate text-[11px] text-white/40">
                                  {inquiry.email || "—"}
                                </p>
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <span className="inline-flex w-fit items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-100">
                                  {inquiryType}
                                </span>
                              </td>
                              <td className="px-4 py-5 align-middle text-xs text-white/65 sm:px-6">
                                {formatCreatedAt(inquiry.createdAt)}
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <select
                                  value={inquiry.status || "Pending"}
                                  disabled={updatingInquiryId === inquiry._id}
                                  onChange={(event) =>
                                    handleInquiryStatusChange(
                                      inquiry._id,
                                      event.target.value,
                                    )
                                  }
                                  className={`w-full min-w-[120px] rounded-lg border px-2 py-1.5 text-xs outline-none [color-scheme:dark] focus:border-amber-400/50 disabled:opacity-60 ${getInquiryStatusStyles(inquiry.status || "Pending")}`}
                                >
                                  {INQUIRY_STATUS_OPTIONS.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                      className="bg-zinc-950 text-white"
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-5 align-middle sm:px-6">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteInquiry(inquiry._id)
                                  }
                                  disabled={deletingInquiryId === inquiry._id}
                                  aria-label={`Delete inquiry from ${inquiry.name || inquiry._id}`}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-100 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>

                            {isExpanded ? (
                              <tr className="border-b border-white/8">
                                <td colSpan={7} className="p-0">
                                  <InquiryExpandedPanel inquiry={inquiry} />
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
