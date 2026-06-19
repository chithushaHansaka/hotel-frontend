"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = "http://localhost:5000/api/amenities";

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState(""); // Bug 2 Fixed: set initial value to empty string
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [features, setFeatures] = useState(""); // Comma separated string
  const [images, setImages] = useState<FileList | null>(null);

  // Fetch Amenities
  const fetchAmenities = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setAmenities(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Create Amenity
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images || images.length === 0)
      return alert("Please select at least one image");

    setIsSubmitting(true);
    const token = localStorage.getItem("hotel_admin_token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("tag", tag);
    formData.append("shortDescription", shortDesc);
    formData.append("longDescription", longDesc);

    // Convert comma separated string to JSON array for backend
    const featureArray = features
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f !== "");
    formData.append("features", JSON.stringify(featureArray));

    // Append multiple images to formData
    Array.from(images).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        // Reset form
        setTitle("");
        setTag(""); // Also reset tag correctly
        setShortDesc("");
        setLongDesc("");
        setFeatures("");
        setImages(null);
        fetchAmenities(); // Refresh list
      } else {
        // Updated error message to show exact details
        alert(
          "Backend Error: " +
            data.message +
            "\n\nDetails: " +
            (data.error || "No extra details"),
        );
      }
    } catch (error: any) {
      console.error("Error creating amenity:", error);
      // Catch network or unexpected frontend crashes
      alert(
        "Network Error: " +
          String(error) +
          "\n\n(Press F12 and check Console for more info)",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Amenity
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return;

    const token = localStorage.getItem("hotel_admin_token");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchAmenities(); // Refresh list
      }
    } catch (error) {
      console.error("Error deleting amenity:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Resort Amenities
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Manage luxury experiences and facilities
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-full bg-amber-400/10 px-5 py-2.5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
        >
          <Plus size={16} />
          {showForm ? "Cancel" : "Add New Amenity"}
        </button>
      </div>

      {/* Add New Form */}
      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"
                  placeholder="e.g. Infinity Pool"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                  Tag / Subtitle
                </label>
                <input
                  required
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"
                  placeholder="e.g. SIGNATURE EXPERIENCE"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Short Description (For Card)
              </label>
              <textarea
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"
                placeholder="A brief description for the amenity card..."
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Long Description (For Details Page)
              </label>
              <textarea
                required
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"
                placeholder="Detailed description..."
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Features (Comma separated)
              </label>
              <input
                type="text"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"
                placeholder="e.g. Thermal Suites, Organic Oils, Master Therapists"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Images (Select multiple)
              </label>
              <input
                required
                multiple
                type="file"
                accept="image/*"
                onChange={(e) => setImages(e.target.files)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-amber-400/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-200 hover:file:bg-amber-400/20"
              />
              <p className="mt-2 text-xs text-white/40">
                Hold Ctrl (or Cmd) to select multiple images. Max 5 images.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 size={18} />
                  </motion.div>
                ) : (
                  "Save Amenity"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Amenities List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="text-amber-400" size={32} />
          </motion.div>
        </div>
      ) : amenities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 py-20 text-white/50">
          <ImageIcon size={48} className="mb-4 opacity-50" />
          <p>No amenities added yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {amenities.map((amenity) => (
            <div
              key={amenity._id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4 transition-all hover:border-white/20 hover:bg-black/60"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl relative">
                {/* Safe check: render first image if exists */}
                <img
                  src={amenity.images?.[0]}
                  alt={amenity.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-md">
                  {amenity.images?.length || 0} Image(s)
                </div>
              </div>
              <div className="mt-5 px-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-200/80">
                  {amenity.tag}
                </div>
                <h3 className="mt-2 text-xl font-medium text-white">
                  {amenity.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/60">
                  {amenity.shortDescription}
                </p>

                <button
                  onClick={() => handleDelete(amenity._id)}
                  className="absolute right-6 top-6 rounded-full bg-black/50 p-2.5 text-red-400 opacity-0 backdrop-blur-md transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                  title="Delete Amenity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
