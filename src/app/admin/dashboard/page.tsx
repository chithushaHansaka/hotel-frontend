"use client";

import { useEffect, useState } from "react";

const API_BASE =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    rooms: 0,
    offers: 0,
    inquiries: 0,
    admins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const token = window.localStorage.getItem("hotel_admin_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Inquiries වලටත් headers (Token එක) අනිවාර්යයෙන්ම යවන්න ඕනේ
        const [roomsRes, offersRes, inquiriesRes, adminsRes] =
          await Promise.all([
            fetch(`${API_BASE}/rooms`).catch(() => null),
            fetch(`${API_BASE}/offers`).catch(() => null),
            fetch(`${API_BASE}/inquiries`, { headers }).catch(() => null), // <-- මෙතන තමයි වෙනස කළේ
            fetch(`${API_BASE}/auth/users`, { headers }).catch(() => null),
          ]);

        const roomsData = roomsRes?.ok ? await roomsRes.json() : { data: [] };
        const offersData = offersRes?.ok
          ? await offersRes.json()
          : { data: [] };
        const inquiriesData = inquiriesRes?.ok
          ? await inquiriesRes.json()
          : { data: [] };
        const adminsData = adminsRes?.ok
          ? await adminsRes.json()
          : { data: [] };

        if (isMounted) {
          setCounts({
            rooms: roomsData.data?.length || 0,
            offers: offersData.data?.length || 0,
            inquiries: inquiriesData.data?.length || 0,
            admins: adminsData.data?.length || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Total Rooms",
      value: isLoading ? "..." : counts.rooms.toString(),
      detail: "Total luxury suites & rooms in the inventory.",
    },
    {
      label: "Active Offers",
      value: isLoading ? "..." : counts.offers.toString(),
      detail: "Seasonal packages currently live on the site.",
    },
    {
      label: "New Inquiries",
      value: isLoading ? "..." : counts.inquiries.toString(),
      detail: "Guest requests received from the contact portal.",
    },
    {
      label: "System Admins",
      value: isLoading ? "..." : counts.admins.toString(),
      detail: "Authorized personnel with access to the command suite.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.34em] text-amber-200/80">
            Luxury Operations
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Welcome back to the command suite.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            This is the private control panel for the hotel brand. Track room
            inventory, promote offers, monitor inquiries, and keep every guest
            touchpoint polished.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all hover:bg-white/5"
          >
            <div className="text-xs uppercase tracking-[0.28em] text-white/45">
              {stat.label}
            </div>
            <div className="mt-4 text-4xl font-semibold tracking-tight text-white">
              {stat.value}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">
              {stat.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-2xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                Today&apos;s Activity
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                A polished overview of the property.
              </h3>
            </div>
            <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-amber-100 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Live
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {[
              ["Front desk", "8 arrivals scheduled by 3:00 PM."],
              ["Housekeeping", "14 rooms queued for refresh cycles."],
              ["Dining", "Chef’s table and sunset service nearly full."],
            ].map(([title, description]) => (
              <div
                key={title}
                className="flex items-center justify-between gap-6 rounded-2xl border border-white/8 bg-white/5 px-4 py-4 hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="mt-1 text-sm text-white/55">
                    {description}
                  </div>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_0_6px_rgba(201,163,107,0.12)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-amber-300/10 via-white/5 to-transparent p-6 backdrop-blur-2xl sm:p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
            Control Notes
          </div>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-white/65">
            <li className="rounded-2xl border border-white/8 bg-black/25 p-4">
              Review new inquiries before the evening concierge shift.
            </li>
            <li className="rounded-2xl border border-white/8 bg-black/25 p-4">
              Refresh room and offer copy to keep the public site aligned.
            </li>
            <li className="rounded-2xl border border-white/8 bg-black/25 p-4">
              Monitor active sessions and secure administrative accesses.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
