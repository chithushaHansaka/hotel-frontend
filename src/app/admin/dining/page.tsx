"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";

const API_URL =
  "https://thelux-backend-api-fhejbugpe6a4heae.centralindia-01.azurewebsites.net/api/dining";

type DiningItem = {
  _id: string;
  name: string;
  slug?: string;
  category?: string;
  description: string;
  buttonLabel?: string;
  highlights?: string[];
  images?: string[];
  menu?: Array<{
    name?: string;
    price?: number;
    description?: string;
  }>;
  isActive?: boolean;
};

type MenuItemForm = {
  name: string;
  price: string;
  description: string;
};

type DiningFormState = {
  name: string;
  slug: string;
  category: string;
  description: string;
  buttonLabel: string;
  highlights: string;
  menu: MenuItemForm[];
  isActive: boolean;
};

const emptyFormState: DiningFormState = {
  name: "",
  slug: "",
  category: "",
  description: "",
  buttonLabel: "View Details",
  highlights: "",
  menu: [{ name: "", price: "", description: "" }],
  isActive: true,
};

const slugify = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminDiningPage() {
  const [items, setItems] = useState<DiningItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DiningItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<DiningFormState>(emptyFormState);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("hotel_admin_token")
      : null;

  const loadDiningItems = async () => {
    try {
      setError("");
      const response = await fetch(API_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load dining items.");
      }

      setItems(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load dining items.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiningItems();
  }, []);

  const resetForm = () => {
    setFormState(emptyFormState);
    setEditingItem(null);
    setImageFiles([]);
    setCurrentImages([]);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: DiningItem) => {
    setEditingItem(item);
    setFormState({
      name: item.name || "",
      slug: item.slug || slugify(item.name),
      category: item.category || "",
      description: item.description || "",
      buttonLabel: item.buttonLabel || "View Details",
      highlights: Array.isArray(item.highlights)
        ? item.highlights.join(", ")
        : "",
      menu:
        Array.isArray(item.menu) && item.menu.length > 0
          ? item.menu.map((menuItem) => ({
              name: menuItem?.name || "",
              price:
                menuItem?.price === undefined || menuItem?.price === null
                  ? ""
                  : String(menuItem.price),
              description: menuItem?.description || "",
            }))
          : [{ name: "", price: "", description: "" }],
      isActive: item.isActive !== false,
    });
    setCurrentImages(Array.isArray(item.images) ? item.images : []);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type, checked } = event.target;

    setFormState((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "name" && !editingItem?.slug && !formState.slug) {
      setFormState((previous) => ({
        ...previous,
        slug: slugify(value),
      }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageFiles(Array.from(event.target.files || []));
  };

  const handleMenuChange = (
    index: number,
    field: keyof MenuItemForm,
    value: string,
  ) => {
    setFormState((previous) => ({
      ...previous,
      menu: previous.menu.map((menuItem, menuIndex) =>
        menuIndex === index ? { ...menuItem, [field]: value } : menuItem,
      ),
    }));
  };

  const addMenuItem = () => {
    setFormState((previous) => ({
      ...previous,
      menu: [...previous.menu, { name: "", price: "", description: "" }],
    }));
  };

  const removeMenuItem = (index: number) => {
    setFormState((previous) => ({
      ...previous,
      menu:
        previous.menu.length > 1
          ? previous.menu.filter((_, menuIndex) => menuIndex !== index)
          : [{ name: "", price: "", description: "" }],
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("slug", formState.slug || slugify(formState.name));
      formData.append("category", formState.category);
      formData.append("description", formState.description);
      formData.append("buttonLabel", formState.buttonLabel);
      formData.append("highlights", formState.highlights);
      formData.append("menu", JSON.stringify(formState.menu));
      formData.append("isActive", String(formState.isActive));
      formData.append("existingImages", JSON.stringify(currentImages));

      imageFiles.forEach((file) => formData.append("images", file));

      const response = await fetch(
        editingItem ? `${API_URL}/${editingItem._id}` : API_URL,
        {
          method: editingItem ? "PUT" : "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save dining item.");
      }

      setSuccess(
        editingItem
          ? "Dining item updated successfully."
          : "Dining item created successfully.",
      );
      setIsModalOpen(false);
      resetForm();
      await loadDiningItems();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save dining item.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    const confirmed = window.confirm("Delete this dining item?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_URL}/${itemId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete dining item.");
      }

      setSuccess("Dining item deleted successfully.");
      setItems((previous) => previous.filter((item) => item._id !== itemId));
      setExpandedId((previous) => (previous === itemId ? null : previous));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete dining item.",
      );
    }
  };

  const previewImages = useMemo(() => currentImages, [currentImages]);

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">
            Admin Dining
          </div>
          <h2 className="mt-2 text-3xl font-semibold">Dining Experiences</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
            Manage the restaurant, bar, and private dining cards that power the
            live public dining pages.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black"
        >
          <Plus size={16} />
          Add Dining Item
        </button>
      </div>

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

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md">
        {isLoading ? (
          <div className="p-8 text-sm text-white/55">
            Loading dining items...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-sm text-white/55">No dining items yet.</div>
        ) : (
          <div className="divide-y divide-white/8">
            {items.map((item) => {
              const isExpanded = expandedId === item._id;
              const coverImage = item.images?.[0];

              return (
                <div key={item._id} className="p-5 sm:p-6">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    className="grid w-full gap-4 text-left md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center"
                  >
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={item.name}
                          className="h-24 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center text-white/30">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-white">
                          {item.name}
                        </h3>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/55">
                          {item.category || "Dining"}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] ${
                            item.isActive !== false
                              ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                              : "border border-white/10 bg-white/5 text-white/45"
                          }`}
                        >
                          {item.isActive !== false ? "Active" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditModal(item);
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition hover:border-amber-400/30 hover:text-amber-200"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(item._id);
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 p-3 text-rose-100 transition hover:bg-rose-400/20"
                      >
                        <Trash2 size={16} />
                      </button>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-white/45" />
                      ) : (
                        <ChevronDown size={18} className="text-white/45" />
                      )}
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="mt-5 grid gap-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-5 lg:grid-cols-3">
                      <div className="space-y-2 text-sm text-white/65">
                        <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                          Slug
                        </div>
                        <div>{item.slug || slugify(item.name)}</div>
                      </div>
                      <div className="space-y-2 text-sm text-white/65">
                        <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                          Highlights
                        </div>
                        <div>
                          {item.highlights?.length
                            ? item.highlights.join(", ")
                            : "No highlights set"}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-white/65 lg:text-right">
                        <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                          Media
                        </div>
                        <div>{item.images?.length || 0} image(s)</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0d0f13] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/45">
                  {editingItem ? "Edit Dining Item" : "Create Dining Item"}
                </div>
                <h3 className="mt-2 text-2xl font-semibold">Dining Form</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-white/70">Name</span>
                  <input
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/70">Slug</span>
                  <input
                    name="slug"
                    value={formState.slug}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                    placeholder="Generated from name if blank"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-white/70">Category</span>
                  <input
                    name="category"
                    value={formState.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                    placeholder="Restaurant, Bar, Private Dining"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-white/70">Button Label</span>
                  <input
                    name="buttonLabel"
                    value={formState.buttonLabel}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm text-white/70">Description</span>
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                  required
                />
              </label>

              <label className="space-y-2 block">
                <span className="text-sm text-white/70">Highlights</span>
                <textarea
                  name="highlights"
                  value={formState.highlights}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                  placeholder="Seasonal menu, Live jazz, Private table"
                />
              </label>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">Menu</div>
                    <p className="text-xs text-white/45">
                      Add simple menu items with name, price, and description.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMenuItem}
                    className="rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100"
                  >
                    Add Menu Item
                  </button>
                </div>

                <div className="space-y-4">
                  {formState.menu.map((menuItem, index) => (
                    <div
                      key={`${index}-${menuItem.name}`}
                      className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                          Menu Item {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMenuItem(index)}
                          className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-100"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm text-white/70">Name</span>
                          <input
                            value={menuItem.name}
                            onChange={(event) =>
                              handleMenuChange(
                                index,
                                "name",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                            placeholder="Seared Scallops"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-white/70">Price</span>
                          <input
                            value={menuItem.price}
                            onChange={(event) =>
                              handleMenuChange(
                                index,
                                "price",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                            placeholder="120"
                            type="number"
                          />
                        </label>
                      </div>

                      <label className="mt-4 block space-y-2">
                        <span className="text-sm text-white/70">
                          Description
                        </span>
                        <textarea
                          value={menuItem.description}
                          onChange={(event) =>
                            handleMenuChange(
                              index,
                              "description",
                              event.target.value,
                            )
                          }
                          rows={3}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                          placeholder="Brief menu note"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formState.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                <span className="text-sm text-white/70">Publish publicly</span>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm text-white/70">Images</span>
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-4">
                  <Upload size={18} className="text-amber-300" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full text-sm text-white/70"
                  />
                </div>
              </label>

              {previewImages.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {previewImages.map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt="Dining preview"
                      className="h-40 w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving
                    ? "Saving..."
                    : editingItem
                      ? "Update Dining Item"
                      : "Create Dining Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
