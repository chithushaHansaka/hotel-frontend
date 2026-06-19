"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";

const API_URL = "http://localhost:5000/api/rooms";

type Room = {
  _id: string;
  name: string;
  description: string;
  price: number;
  size?: string;
  bed?: string;
  view?: string;
  images?: string[];
  amenities?: string[];
  totalRooms?: number;
  createdAt: string;
};

type RoomFormState = {
  name: string;
  description: string;
  price: string;
  size: string;
  bed: string;
  view: string;
  amenities: string;
  totalRooms: string;
};

const emptyForm: RoomFormState = {
  name: "",
  description: "",
  price: "",
  size: "",
  bed: "",
  view: "",
  amenities: "",
  totalRooms: "1",
};

const toCommaSeparatedString = (values?: string[]) => (values || []).join(", ");

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [form, setForm] = useState<RoomFormState>(emptyForm);

  const isEditing = Boolean(editingRoomId);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load rooms.");
      }

      setRooms(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load rooms.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const totalRooms = useMemo(() => rooms.length, [rooms.length]);

  const openCreateModal = () => {
    setEditingRoomId(null);
    setForm(emptyForm);
    setCurrentImages([]);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoomId(room._id);
    setForm({
      name: room.name || "",
      description: room.description || "",
      price: room.price?.toString() || "",
      size: room.size || "",
      bed: room.bed || "",
      view: room.view || "",
      amenities: toCommaSeparatedString(room.amenities),
      totalRooms: room.totalRooms?.toString() || "1",
    });
    setCurrentImages(room.images || []);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoomId(null);
    setForm(emptyForm);
    setCurrentImages([]);
    setImageFiles([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = window.localStorage.getItem("hotel_admin_token");

      if (!token) {
        throw new Error("Missing admin token. Please sign in again.");
      }

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("price", form.price);
      payload.append("size", form.size);
      payload.append("bed", form.bed);
      payload.append("view", form.view);
      payload.append("amenities", form.amenities);
      payload.append("totalRooms", form.totalRooms);
      payload.append("existingImages", JSON.stringify(currentImages));

      imageFiles.forEach((file) => {
        payload.append("images", file);
      });

      const response = await fetch(
        editingRoomId ? `${API_URL}/${editingRoomId}` : API_URL,
        {
          method: editingRoomId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to save room.");
      }

      const savedRoom = result?.data;

      setRooms((current) => {
        if (!savedRoom) {
          return current;
        }

        if (editingRoomId) {
          return current.map((room) =>
            room._id === editingRoomId ? savedRoom : room,
          );
        }

        return [savedRoom, ...current];
      });

      closeModal();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save room.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const token = window.localStorage.getItem("hotel_admin_token");

      if (!token) {
        throw new Error("Missing admin token. Please sign in again.");
      }

      setDeletingRoomId(roomId);

      const response = await fetch(`${API_URL}/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete room.");
      }

      setRooms((current) => current.filter((room) => room._id !== roomId));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete room.",
      );
    } finally {
      setDeletingRoomId("");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.34em] text-amber-200/80">
              Room Inventory
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Manage rooms and suite content
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Create, update, and remove room listings from the private luxury
              dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="lux-action inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(212,165,116,0.45)]"
          >
            <Plus size={16} />
            Add New Room
          </button>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Total Rooms", String(totalRooms)],
          ["Latest Room", rooms[0]?.name || "No rooms yet"],
          ["Status", "CRUD enabled"],
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
              Room List
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {isLoading ? "Loading rooms..." : "Existing room records"}
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
        ) : rooms.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center text-white/60">
            No rooms found.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left">
                <thead className="bg-black/30 text-xs uppercase tracking-[0.28em] text-white/45">
                  <tr>
                    <th className="px-5 py-4 font-medium">Room</th>
                    <th className="px-5 py-4 font-medium">Price</th>
                    <th className="px-5 py-4 font-medium">Specs</th>
                    <th className="px-5 py-4 font-medium">Media</th>
                    <th className="px-5 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rooms.map((room) => (
                    <tr key={room._id} className="hover:bg-white/5">
                      <td className="px-5 py-5 align-top">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-amber-200">
                            <BedDouble size={18} />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-white">
                              {room.name}
                            </div>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60 line-clamp-2">
                              {room.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
                              {room.amenities?.slice(0, 3).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top text-sm text-white/75">
                        <div className="text-lg font-semibold text-amber-200">
                          {formatPrice(room.price)}
                        </div>
                        <div className="mt-1 text-white/55">
                          {room.size || "Size not set"}
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top text-sm text-white/75">
                        <div className="space-y-2">
                          <div>
                            <span className="text-white/45">Bed:</span>{" "}
                            {room.bed || "N/A"}
                          </div>
                          <div>
                            <span className="text-white/45">View:</span>{" "}
                            {room.view || "N/A"}
                          </div>
                          <div>
                            <span className="text-white/45">Inventory:</span>{" "}
                            {room.totalRooms ?? 1}
                          </div>
                          <div>
                            <span className="text-white/45">Amenities:</span>{" "}
                            {room.amenities?.length || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top text-sm text-white/75">
                        <div className="space-y-2">
                          <div>
                            <span className="text-white/45">Images:</span>{" "}
                            {room.images?.length || 0}
                          </div>
                          <div>
                            <span className="text-white/45">Created:</span>{" "}
                            {new Date(room.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(room)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white/80 transition hover:bg-white/10 hover:text-white"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(`Delete room \"${room.name}\"?`)
                              ) {
                                handleDeleteRoom(room._id);
                              }
                            }}
                            disabled={deletingRoomId === room._id}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-rose-100 transition hover:bg-rose-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={12} />
                            {deletingRoomId === room._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-neutral-800 bg-[#0a0a0a] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,170,94,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_34%)]" />
            <div className="relative border-b border-white/10 p-6 pr-14 sm:p-8 sm:pr-16">
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-amber-400/40 hover:text-amber-300"
                aria-label="Close room modal"
              >
                <X size={18} />
              </button>

              <p className="text-[11px] uppercase tracking-[0.45em] text-amber-300/85">
                {isEditing ? "Edit Room" : "Add Room"}
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {isEditing
                  ? "Update room details"
                  : "Create a new room listing"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                Manage the room catalog with the same polished luxury tone used
                across the public site.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
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
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="Deluxe City Room"
                    required
                  />
                </label>

                <label className="block sm:col-span-2">
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
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="Describe the room experience..."
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Price
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
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="350"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Total Inventory / Number of Rooms
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.totalRooms}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        totalRooms: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="1"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Size
                  </span>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        size: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="45 sqm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Bed
                  </span>
                  <input
                    type="text"
                    value={form.bed}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bed: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="King Bed"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    View
                  </span>
                  <input
                    type="text"
                    value={form.view}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        view: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="Ocean View"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Image Uploads
                  </span>
                  <div className="rounded-2xl border border-dashed border-white/12 bg-black/25 p-5">
                    <div className="flex items-center gap-3 text-sm text-white/65">
                      <ImagePlus size={16} className="text-amber-300" />
                      Upload one or more room images from your device.
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) =>
                        setImageFiles(Array.from(event.target.files || []))
                      }
                      className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
                    />

                    <div className="mt-4 space-y-4">
                      {currentImages.length > 0 ? (
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                            Existing Images
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            {currentImages.map((imageUrl) => (
                              <div
                                key={imageUrl}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-black/25"
                              >
                                <img
                                  src={imageUrl}
                                  alt="Room preview"
                                  className="h-28 w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {imageFiles.length > 0 ? (
                        <div className="text-sm text-white/65">
                          {imageFiles.length} new file
                          {imageFiles.length > 1 ? "s" : ""} selected.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55">
                    Amenities
                  </span>
                  <textarea
                    rows={3}
                    value={form.amenities}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amenities: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/45 focus:bg-black/50"
                    placeholder="Free Wi-Fi, Butler Service, Private Balcony"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lux-action inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(212,165,116,0.3)] transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditing
                      ? "Update Room"
                      : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
