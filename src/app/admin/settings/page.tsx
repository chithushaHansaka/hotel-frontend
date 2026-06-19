"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Sparkles, UserPlus, Trash2 } from "lucide-react";
import AddonServicesPanel from "@/components/admin/AddonServicesPanel";

const API_URL = "http://localhost:5000/api/settings";
const AUTH_API_URL = "http://localhost:5000/api/auth";

const SETTINGS_TABS = [
  { id: "global", label: "Global Settings" },
  { id: "addons", label: "Add-on Services" },
];

function SettingsTabs({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-black/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {SETTINGS_TABS.map((tab) => {
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
                layoutId="settings-tab-pill"
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

type SiteSettings = {
  hotelName: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  legacyTitle: string;
  homeStats: Array<{
    value: string;
    label: string;
  }>;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  footerAddress: string;
};

const defaultSettings: SiteSettings = {
  hotelName: "THE LUX Private Collection",
  logoUrl: "",
  heroTitle: "A Sanctuary of Timeless Elegance",
  heroSubtitle: "Where luxury meets serenity in the heart of Colombo.",
  heroImageUrl: "",
  legacyTitle: "The LUX Legacy",
  homeStats: [
    { value: "58", label: "Bespoke Ocean-View Suites" },
    { value: "1:1", label: "Personal Butler-to-Guest Ratio" },
    { value: "4", label: "Signature Culinary Venues" },
    { value: "360°", label: "Panoramic Colombo Views" },
  ],
  aboutText:
    "Built upon a foundation of grace, we redefine 5-star hospitality. Our story is woven with threads of heritage, meticulously curated for the modern connoisseur.",
  contactEmail: "info@thelux.com",
  contactPhone: "+94 11 234 5678",
  whatsappNumber: "+94 77 123 4567",
  footerAddress: "123 Luxury Avenue, Colombo, Sri Lanka",
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("global");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroBannerFiles, setHeroBannerFiles] = useState<File[]>([]);

  // Admin Management States
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    let isMounted = true;

    // Get current logged-in user email
    const userString = window.localStorage.getItem("hotel_admin_user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setCurrentUserEmail(user.email);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }

    const loadSettingsAndAdmins = async () => {
      try {
        const token = window.localStorage.getItem("hotel_admin_token");

        // 1. Load Settings
        const response = await fetch(API_URL);
        const payload = await response.json().catch(() => null);

        if (response.ok && isMounted) {
          setSettings({
            hotelName: payload?.data?.hotelName || defaultSettings.hotelName,
            logoUrl: payload?.data?.logoUrl || "",
            heroTitle: payload?.data?.heroTitle || defaultSettings.heroTitle,
            heroSubtitle:
              payload?.data?.heroSubtitle || defaultSettings.heroSubtitle,
            heroImageUrl: payload?.data?.heroImageUrl || "",
            legacyTitle:
              payload?.data?.legacyTitle || defaultSettings.legacyTitle,
            homeStats: Array.isArray(payload?.data?.homeStats)
              ? payload.data.homeStats
                  .slice(0, 4)
                  .map((item: any, index: number) => ({
                    value:
                      typeof item?.value === "string"
                        ? item.value
                        : defaultSettings.homeStats[index].value,
                    label:
                      typeof item?.label === "string"
                        ? item.label
                        : defaultSettings.homeStats[index].label,
                  }))
              : defaultSettings.homeStats,
            aboutText: payload?.data?.aboutText || defaultSettings.aboutText,
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

        // 2. Load Admins
        if (token) {
          const adminsRes = await fetch(`${AUTH_API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const adminsData = await adminsRes.json();
          if (adminsRes.ok && adminsData.success && isMounted) {
            setAdmins(adminsData.data);
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load data.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettingsAndAdmins();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Functions for Settings ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const token = window.localStorage.getItem("hotel_admin_token");
      if (!token) throw new Error("Missing admin token. Please sign in again.");

      const formData = new FormData();
      formData.append("hotelName", settings.hotelName);
      formData.append("logoUrl", settings.logoUrl);
      formData.append("heroTitle", settings.heroTitle);
      formData.append("heroSubtitle", settings.heroSubtitle);
      formData.append("heroImageUrl", settings.heroImageUrl);
      formData.append("legacyTitle", settings.legacyTitle);
      formData.append("homeStats", JSON.stringify(settings.homeStats));
      formData.append("aboutText", settings.aboutText);
      formData.append("contactEmail", settings.contactEmail);
      formData.append("contactPhone", settings.contactPhone);
      formData.append("whatsappNumber", settings.whatsappNumber);
      formData.append("footerAddress", settings.footerAddress);

      if (logoFile) formData.append("logo", logoFile);

      if (heroBannerFiles.length > 0) {
        heroBannerFiles.forEach((file) => {
          formData.append("heroBanners", file);
        });
      }

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.message || "Failed to save site settings.");

      setMessage("Settings saved successfully.");
      setLogoFile(null);
      setHeroBannerFiles([]);

      // Auto reload page to reflect image changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- Functions for Admin Management ---
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminMessage("");
    setIsAddingAdmin(true);
    try {
      const res = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add admin");

      setAdminMessage("User added successfully!");
      setAdminForm({ name: "", email: "", password: "", role: "Admin" });

      // Refresh admins list locally
      setAdmins([data.data, ...admins]);
      setTimeout(() => setAdminMessage(""), 3000);
    } catch (err: any) {
      setAdminError(err.message);
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (email === currentUserEmail) {
      alert("You cannot delete your own account!");
      return;
    }
    if (!confirm(`Are you sure you want to completely remove ${email}?`))
      return;

    try {
      const token = window.localStorage.getItem("hotel_admin_token");
      const res = await fetch(`${AUTH_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      setAdmins(admins.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.34em] text-amber-200/80">
              Super Admin Settings
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hotel identity and service controls
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Update global brand settings and curate premium booking add-ons from
              one secure panel.
            </p>
          </div>

          <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </section>

      <AnimatePresence mode="wait">
        {activeTab === "global" ? (
          <motion.div
            key="global-settings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="will-change-transform"
          >
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8"
        >
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">
            <Sparkles size={14} />
            Global Site Settings
          </div>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
              Brand Identity
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Hotel Name
                </span>
                <input
                  type="text"
                  value={settings.hotelName}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      hotelName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Logo Image Upload
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(event) =>
                    setLogoFile(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
                />
              </label>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Current Logo
                </div>
                <div className="mt-4 flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-white/35">
                      No logo configured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
              Hero Section
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Hero Title
                </span>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      heroTitle: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Hero Subtitle
                </span>
                <input
                  type="text"
                  value={settings.heroSubtitle}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      heroSubtitle: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Hero Banners Upload (Max 3)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(event) => {
                    if (event.target.files) {
                      const filesArray = Array.from(event.target.files).slice(
                        0,
                        3,
                      );
                      setHeroBannerFiles(filesArray);
                    }
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
                />
                {heroBannerFiles.length > 0 && (
                  <p className="mt-2 text-xs text-emerald-400">
                    {heroBannerFiles.length} file(s) selected.
                  </p>
                )}
              </label>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Current Hero Banner
                </div>
                <div className="mt-4 flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {settings.heroImageUrl ? (
                    <img
                      src={settings.heroImageUrl}
                      alt="Hero preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-white/35">
                      No hero image configured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
              Legacy
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                Legacy Main Title
              </span>
              <input
                type="text"
                value={settings.legacyTitle}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    legacyTitle: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                About Text
              </span>
              <textarea
                rows={5}
                value={settings.aboutText}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    aboutText: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
              />
            </label>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
              Marketing Stats
            </div>
            <div className="mt-5 grid gap-4">
              {settings.homeStats.map((stat, index) => (
                <div
                  key={`home-stat-${index}`}
                  className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                    Stat {index + 1}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                        Value
                      </span>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(event) =>
                          setSettings((current) => ({
                            ...current,
                            homeStats: current.homeStats.map((item, i) =>
                              i === index
                                ? { ...item, value: event.target.value }
                                : item,
                            ),
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-amber-300/45"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                        Label
                      </span>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(event) =>
                          setSettings((current) => ({
                            ...current,
                            homeStats: current.homeStats.map((item, i) =>
                              i === index
                                ? { ...item, label: event.target.value }
                                : item,
                            ),
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-amber-300/45"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
              Contact Details
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Email
                </span>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      contactEmail: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-amber-300/45"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Phone
                </span>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      contactPhone: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-amber-300/45"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  WhatsApp Number
                </span>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      whatsappNumber: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-amber-300/45"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Footer Address
                </span>
                <input
                  type="text"
                  value={settings.footerAddress}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      footerAddress: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-amber-300/45"
                />
              </label>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="lux-action inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(201,163,107,0.32)] transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </form>

        {/* --- Right Side Column (Live Preview + Admin Management) --- */}
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">
              Live Preview
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-amber-300/20 bg-amber-300/10 text-lg font-semibold text-amber-100">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Hotel logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  settings.hotelName.slice(0, 1)
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
                  Public Branding
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {settings.hotelName || defaultSettings.hotelName}
                </h3>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <div className="text-xs uppercase tracking-[0.28em] text-white/45">
                Contact Preview
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <p>{settings.contactEmail}</p>
                <p>{settings.contactPhone}</p>
                <p>{settings.whatsappNumber}</p>
                <p>{settings.footerAddress}</p>
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
                User Access
              </div>
              <div className="rounded-full bg-amber-400/10 px-3 py-1 text-[10px] uppercase tracking-wider text-amber-200 border border-amber-400/20">
                {admins.length} Users
              </div>
            </div>

            {/* Add New Admin Form */}
            <form
              onSubmit={handleAddAdmin}
              autoComplete="off"
              className="space-y-4 mb-8 p-5 rounded-[1.5rem] border border-white/5 bg-white/5"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-4 flex items-center gap-2">
                <UserPlus size={14} /> Add New User
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  autoComplete="off"
                  value={adminForm.name}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-300/45"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  autoComplete="off"
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-300/45"
                />
                <input
                  type="password"
                  placeholder="Secure Password"
                  required
                  autoComplete="new-password"
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-300/45"
                />
                <select
                  value={adminForm.role}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, role: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm text-white/70 outline-none focus:border-amber-300/45 appearance-none"
                >
                  <option value="Admin">Normal Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                </select>
              </div>

              {adminError && (
                <div className="text-xs text-rose-400 mt-2">{adminError}</div>
              )}
              {adminMessage && (
                <div className="text-xs text-emerald-400 mt-2">
                  {adminMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isAddingAdmin}
                className="w-full mt-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {isAddingAdmin ? "Creating..." : "Create Account"}
              </button>
            </form>

            {/* List of Admins */}
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between p-4 rounded-[1.25rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="truncate pr-4">
                    <div className="text-sm font-medium text-white truncate">
                      {admin.name}
                    </div>
                    <div className="text-xs text-white/50 truncate">
                      {admin.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${admin.role === "SuperAdmin" ? "bg-amber-400/20 text-amber-200 border border-amber-400/30" : "bg-white/10 text-white/70 border border-white/10"}`}
                    >
                      {admin.role === "SuperAdmin" ? "Super" : "Admin"}
                    </span>
                    {admin.email !== currentUserEmail && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteAdmin(admin._id, admin.email)
                        }
                        className="text-white/30 hover:text-rose-400 transition-colors p-1"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
          </motion.div>
        ) : (
          <motion.section
            key="addon-settings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8 will-change-transform"
          >
            <AddonServicesPanel />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
