"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

const ADDONS_API =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/addons";

const ADDON_CATEGORIES = [
  "Transport",
  "Wellness",
  "Dining",
  "Special Setup",
  "Other",
];

const emptyAddonForm = {
  name: "",
  description: "",
  price: "",
  category: "Other",
  isActive: true,
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

type Addon = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
};

export default function AddonServicesPanel() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [deletingAddonId, setDeletingAddonId] = useState("");
  const [form, setForm] = useState(emptyAddonForm);

  const loadAddons = async () => {
    try {
      setError("");
      const response = await fetch(ADDONS_API);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load add-ons.");
      }

      setAddons(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load add-ons.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddons();
  }, []);

  const openCreateModal = () => {
    setEditingAddonId(null);
    setForm(emptyAddonForm);
    setIsModalOpen(true);
  };

  const openEditModal = (addon: Addon) => {
    setEditingAddonId(addon._id);
    setForm({
      name: addon.name,
      description: addon.description,
      price: String(addon.price),
      category: addon.category || "Other",
      isActive: addon.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddonId(null);
    setForm(emptyAddonForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingAddonId ? `${ADDONS_API}/${editingAddonId}` : ADDONS_API,
        {
          method: editingAddonId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            category: form.category,
            isActive: form.isActive,
          }),
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save add-on.");
      }

      const savedAddon = payload?.data;

      setAddons((current) => {
        if (!savedAddon) {
          return current;
        }

        if (editingAddonId) {
          return current.map((item) =>
            item._id === editingAddonId ? savedAddon : item,
          );
        }

        return [savedAddon, ...current];
      });

      setMessage(
        editingAddonId
          ? "Add-on updated successfully."
          : "Add-on created successfully.",
      );
      closeModal();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save add-on.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (!window.confirm("Delete this add-on service?")) {
      return;
    }

    try {
      setDeletingAddonId(addonId);
      setError("");

      const response = await fetch(`${ADDONS_API}/${addonId}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete add-on.");
      }

      setAddons((current) => current.filter((item) => item._id !== addonId));
      setMessage("Add-on deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete add-on.",
      );
    } finally {
      setDeletingAddonId("");
    }
  };

  const toggleAddonActive = async (addon: Addon) => {
    try {
      setError("");

      const response = await fetch(`${ADDONS_API}/${addon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !addon.isActive }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update add-on status.");
      }

      setAddons((current) =>
        current.map((item) =>
          item._id === addon._id
            ? { ...item, isActive: !addon.isActive }
            : item,
        ),
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update add-on status.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
            Booking Enhancements
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Add-on Services
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
            Curate premium enhancements guests can select during the booking
            journey.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="lux-action inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)]"
        >
          <Plus size={16} />
          New Add-on
        </button>
      </div>

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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : addons.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-10 text-center text-white/55">
          No add-on services configured yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addons.map((addon) => (
            <article
              key={addon._id}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">
                      {addon.name}
                    </h4>
                    <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/50">
                      {addon.category}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    {addon.description}
                  </p>
                  <p className="mt-4 text-lg font-medium text-amber-200">
                    {formatPrice(addon.price)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAddonActive(addon)}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                    addon.isActive
                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                      : "border-white/10 bg-white/5 text-white/45"
                  }`}
                >
                  {addon.isActive ? "Active" : "Hidden"}
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(addon)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAddon(addon._id)}
                  disabled={deletingAddonId === addon._id}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-rose-100 transition hover:bg-rose-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={12} />
                  {deletingAddonId === addon._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-[2rem] border border-neutral-800 bg-[#0a0a0a] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,170,94,0.12),transparent_32%)]" />
            <div className="relative border-b border-white/10 p-6 pr-14">
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300"
              >
                <X size={18} />
              </button>
              <p className="text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
                {editingAddonId ? "Edit Add-on" : "Create Add-on"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {editingAddonId ? "Update service" : "New premium service"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-4 p-6">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Name
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none focus:border-amber-300/45"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                  Description
                </span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none focus:border-amber-300/45"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Price (LKR)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none focus:border-amber-300/45"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Category
                  </span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none [color-scheme:dark] focus:border-amber-300/45"
                  >
                    {ADDON_CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-zinc-950"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5">
                <span className="text-sm text-white/75">
                  Visible to guests during booking
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      isActive: !current.isActive,
                    }))
                  }
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    form.isActive ? "bg-amber-500" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                      form.isActive ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/75"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingAddonId
                      ? "Update Add-on"
                      : "Create Add-on"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
