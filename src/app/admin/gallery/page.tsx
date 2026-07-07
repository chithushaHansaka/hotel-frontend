"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/gallery";
const GALLERY_CATEGORIES = ["Interior", "Exterior", "Events", "Leisure"];

type GalleryItem = {
  _id: string;
  title: string;
  category: string;
  image: string;
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(GALLERY_CATEGORIES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("hotel_admin_token")
      : null;

  const loadGallery = async () => {
    try {
      setError("");
      const response = await fetch(API_URL);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load gallery items.");
      }

      setItems(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load gallery items.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!imageFile) {
        throw new Error("Please choose an image file.");
      }

      const tokenFromStorage =
        typeof window !== "undefined"
          ? window.localStorage.getItem("hotel_admin_token")
          : null;

      if (!tokenFromStorage) {
        throw new Error("Missing admin token. Please sign in again.");
      }

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", title.trim());
      formData.append("category", category);

      const headers: Record<string, string> = {};
      headers["Authorization"] = `Bearer ${tokenFromStorage}`;

      // Use the native fetch bound to window to avoid wrappers/interceptors.
      const nativeFetch =
        typeof window !== "undefined" ? window.fetch.bind(window) : fetch;

      const response = await nativeFetch(API_URL, {
        method: "POST",
        headers,
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to create gallery image.");
      }

      setSuccess("Gallery image uploaded successfully.");
      setTitle("");
      setCategory(GALLERY_CATEGORIES[0]);
      setImageFile(null);
      await loadGallery();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create gallery image.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    const confirmed = window.confirm("Delete this gallery image?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setDeletingId(itemId);

      if (!token) {
        throw new Error("Missing admin token. Please sign in again.");
      }

      const deleteHeaders: Record<string, string> = {};
      if (token) deleteHeaders["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/${itemId}`, {
        method: "DELETE",
        headers: deleteHeaders,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete gallery image.");
      }

      setItems((current) => current.filter((item) => item._id !== itemId));
      setSuccess("Gallery image deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete gallery image.",
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="space-y-8 text-white">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.34em] text-amber-200/80">
              Gallery Management
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Upload and manage gallery photos
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Add new visuals for rooms, dining, poolside scenes, and exterior
              moments used across the public gallery.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100">
            <Upload size={16} />
            {items.length} photos live
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end"
        >
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
              Title
            </span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Sunset Pool Reflection"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-400/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
              Category
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
            >
              {GALLERY_CATEGORIES.map((option) => (
                <option key={option} value={option} className="bg-zinc-950">
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
              Image File
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] || null)
              }
              className="w-full rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-[0.85rem] text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-amber-500 px-6 text-sm font-semibold text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            {isSaving ? "Uploading..." : "Upload Photo"}
          </button>
        </form>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-semibold text-white">Uploaded Gallery</h3>
          <span className="text-sm text-white/55">
            {isLoading ? "Loading..." : `${items.length} items`}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5"
              >
                <div className="aspect-square animate-pulse bg-white/8" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
                    {item.category}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-medium text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm text-white/55">{item.category}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-medium text-rose-100 transition hover:border-rose-400/40 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    {deletingId === item._id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-6 py-10 text-center text-white/65 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-md">
            No gallery images uploaded yet.
          </div>
        )}
      </section>
    </div>
  );
}
