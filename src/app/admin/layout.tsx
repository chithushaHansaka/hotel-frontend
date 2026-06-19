"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const baseNavigationItems = [
  ["Dashboard", "/admin/dashboard"],
  ["Rooms", "/admin/rooms"],
  ["Amenities", "/admin/amenities"],
  ["Offers", "/admin/offers"],
  ["Dining", "/admin/dining"],
  ["Gallery", "/admin/gallery"],
  ["Reservations", "/admin/bookings"],
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdminRoleSuper, setIsAdminRoleSuper] = useState(false);

  const isPublicRoute =
    pathname === "/admin/login" || pathname === "/admin/forgot-password";

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    const token = window.localStorage.getItem("hotel_admin_token");
    const userString = window.localStorage.getItem("hotel_admin_user");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user?.role === "SuperAdmin") {
          setIsAdminRoleSuper(true);
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    setIsAuthorized(true);
  }, [isPublicRoute, router, pathname]);

  const handleLogout = () => {
    window.localStorage.removeItem("hotel_admin_token");
    window.localStorage.removeItem("hotel_admin_user");
    router.replace("/admin/login");
  };

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#050607,_#07090c_42%,_#030405)]" />
    );
  }

  const navigationItems = [...baseNavigationItems];
  if (isAdminRoleSuper) {
    navigationItems.push(["Settings", "/admin/settings"]);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(201,163,107,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,_#050607,_#07090c_42%,_#030405)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[96rem] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-black/50 px-5 py-6 backdrop-blur-2xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 font-semibold text-black shadow-[0_18px_45px_rgba(201,163,107,0.3)]">
              L
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.34em] text-amber-200 uppercase">
                The LUX
              </div>
              <div className="text-xs text-white/45">Admin Reservations</div>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {navigationItems.map(([label, href]) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={label}
                  href={href as string}
                  className={[
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-300",
                    isActive
                      ? "border-amber-300/30 bg-amber-300/10 text-amber-100 shadow-[0_14px_45px_rgba(201,163,107,0.12)]"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/15 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  <span>{label}</span>
                  <span className="text-xs text-white/35">→</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-[1.75rem] border border-amber-300/15 bg-gradient-to-br from-amber-300/10 via-white/5 to-transparent p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-200/90">
              Access Status
            </div>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Protected session active. Manage the hotel brand from a private
              luxury workspace.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-black/35 px-5 py-4 backdrop-blur-2xl sm:px-8 lg:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-white/40">
                  Admin Panel
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Private Dashboard
                </h1>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="lux-action inline-flex items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 px-5 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-300/15 hover:text-white"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
