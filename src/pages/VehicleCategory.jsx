import { useState } from "react";

const initialCategories = [
  { id: 1, name: "Sedan", icon: "🚗", activeDrivers: 12 },
  { id: 2, name: "SUV", icon: "🚙", activeDrivers: 8 },
  { id: 3, name: "Hatchback", icon: "🚘", activeDrivers: 5 },
  { id: 4, name: "Sports Car", icon: "🏎️", activeDrivers: 0 },
  { id: 5, name: "Minivan", icon: "🚐", activeDrivers: 3 },
];

const initialRideTypes = [
  { id: "economy", label: "Economy", mappedCategoryIds: [1, 3] },
  { id: "luxury", label: "Luxury", mappedCategoryIds: [2, 4] },
  { id: "family", label: "Family", mappedCategoryIds: [5] },
];

export default function VehicleCategoryManagement() {
  const [categories, setCategories] = useState(initialCategories);
  const [rideTypes, setRideTypes] = useState(initialRideTypes);
  const [modal, setModal] = useState(null);
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("🚗");
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => {
    setFormName("");
    setFormIcon("🚗");
    setModal({ type: "add" });
  };
  const openEdit = (cat) => {
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setModal({ type: "edit", data: cat });
  };
  const openDelete = (cat) => {
    setDeleteError("");
    setModal({ type: "delete", data: cat });
  };
  const openMapping = (rt) => setModal({ type: "mapping", data: rt });

  const handleAdd = () => {
    if (!formName.trim()) return;
    const newCat = {
      id: Date.now(),
      name: formName.trim(),
      icon: formIcon,
      activeDrivers: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    setModal(null);
    showToast(`"${newCat.name}" category added`);
  };

  const handleEdit = () => {
    if (!formName.trim()) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === modal.data.id
          ? { ...c, name: formName.trim(), icon: formIcon }
          : c,
      ),
    );
    setModal(null);
    showToast("Category updated");
  };

  const handleDelete = () => {
    const cat = modal.data;
    if (cat.activeDrivers > 0) {
      setDeleteError(
        `Cannot delete — ${cat.activeDrivers} active driver(s) assigned.`,
      );
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setRideTypes((prev) =>
      prev.map((rt) => ({
        ...rt,
        mappedCategoryIds: rt.mappedCategoryIds.filter((id) => id !== cat.id),
      })),
    );
    setModal(null);
    showToast(`"${cat.name}" deleted`, "error");
  };

  const toggleMapping = (rideTypeId, catId) => {
    setRideTypes((prev) =>
      prev.map((rt) => {
        if (rt.id !== rideTypeId) return rt;
        const has = rt.mappedCategoryIds.includes(catId);
        return {
          ...rt,
          mappedCategoryIds: has
            ? rt.mappedCategoryIds.filter((id) => id !== catId)
            : [...rt.mappedCategoryIds, catId],
        };
      }),
    );
  };

  const getCatById = (id) => categories.find((c) => c.id === id);
  const icons = ["🚗", "🚙", "🚘", "🏎️", "🚐", "🛻", "🚕"];

  const rtBorders = [
    "border-2 border-green-500",
    "border-2 border-green-400",
    "border-2 border-green-300",
  ];

  return (
    <div className="min-h-screen text-green-950 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-mono-c { font-family: 'DM Mono', monospace; }
        .slide-up { animation: slideUp 0.18s ease-out; }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .toast-in { animation: toastIn 0.2s ease-out; }
        @keyframes toastIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          className={`toast-in fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border font-mono-c ${
            toast.type === "error"
              ? "bg-red-50 border-red-300 text-red-700"
              : "bg-white border-green-400 text-green-800"
          }`}
        >
          {toast.type === "error" ? "🗑 " : "✓ "}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <p className="font-mono-c text-xs tracking-widest uppercase mb-1 text-green-500">
          Admin Panel · Vehicle
        </p>
        <h1 className="font-display text-3xl font-bold text-green-900">
          Category Management
        </h1>
        <p className="text-sm mt-1 text-green-600">
          Define vehicle types and map them to ride tiers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Categories */}
        <div className="bg-white border border-green-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-green-100 bg-green-50">
            <div>
              <h2 className="font-display text-base font-bold text-green-900">
                Vehicle Categories
              </h2>
              <p className="text-xs mt-0.5 font-mono-c text-green-500">
                {categories.length} types configured
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors font-mono-c"
            >
              <span className="text-base leading-none">+</span> Add Category
            </button>
          </div>

          <div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-5 py-3.5 group transition-colors hover:bg-green-50 border-b border-green-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      {cat.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 font-mono-c ${cat.activeDrivers > 0 ? "text-green-600" : "text-green-300"}`}
                    >
                      {cat.activeDrivers > 0
                        ? `${cat.activeDrivers} active drivers`
                        : "No active drivers"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-xs px-2.5 py-1 rounded-md transition-colors font-mono-c bg-green-100 hover:bg-green-200 text-green-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDelete(cat)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors font-mono-c ${
                      cat.activeDrivers > 0
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-red-50 hover:bg-red-100 text-red-500"
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Ride Type Mapping */}
        <div className="flex flex-col gap-4">
          <div className="px-1">
            <h2 className="font-display text-base font-bold text-green-900">
              Ride Type Mapping
            </h2>
            <p className="text-xs mt-0.5 text-green-500">
              Assign categories to ride tiers — affects live rider options
            </p>
          </div>

          {rideTypes.map((rt, idx) => (
            <div
              key={rt.id}
              className={`${rtBorders[idx]} rounded-2xl overflow-hidden bg-white shadow-sm`}
            >
              <div
                className={`flex items-center justify-between px-5 py-3.5 border-b ${idx === 0 ? "border-green-200 bg-green-50" : idx === 1 ? "border-green-100 bg-green-50/60" : "border-green-100 bg-green-50/30"}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full bg-green-600`}
                    style={{ opacity: 1 - idx * 0.2 }}
                  ></span>
                  <span className="font-display text-sm font-bold text-green-900">
                    {rt.label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono-c font-medium bg-green-100 text-green-700 border border-green-200">
                    {rt.mappedCategoryIds.length} mapped
                  </span>
                </div>
                <button
                  onClick={() => openMapping(rt)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors font-mono-c bg-green-600 hover:bg-green-700 text-white"
                >
                  Modify
                </button>
              </div>
              <div className="px-5 py-3.5 flex flex-wrap gap-2 min-h-[52px] bg-white">
                {rt.mappedCategoryIds.length === 0 ? (
                  <p className="text-xs italic self-center font-mono-c text-green-300">
                    No categories mapped
                  </p>
                ) : (
                  rt.mappedCategoryIds.map((catId) => {
                    const cat = getCatById(catId);
                    if (!cat) return null;
                    return (
                      <span
                        key={catId}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium bg-green-100 text-green-800 border border-green-200"
                      >
                        <span>{cat.icon}</span> {cat.name}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-green-950/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="slide-up bg-white border border-green-200 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Add / Edit */}
            {(modal.type === "add" || modal.type === "edit") && (
              <div className="p-6">
                <h3 className="font-display text-lg font-bold mb-5 text-green-900">
                  {modal.type === "add"
                    ? "Add Vehicle Category"
                    : "Edit Category"}
                </h3>
                <div className="mb-4">
                  <label className="font-mono-c text-xs uppercase tracking-widest mb-2 block text-green-500">
                    Icon
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {icons.map((ic) => (
                      <button
                        key={ic}
                        onClick={() => setFormIcon(ic)}
                        className={`text-xl p-2 rounded-lg border-2 transition-colors ${
                          formIcon === ic
                            ? "border-green-500 bg-green-50"
                            : "border-green-100 hover:border-green-300"
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="font-mono-c text-xs uppercase tracking-widest mb-2 block text-green-500">
                    Name
                  </label>
                  <input
                    className="w-full bg-green-50 border-2 border-green-200 focus:border-green-500 rounded-xl px-4 py-2.5 text-sm text-green-900 outline-none transition-colors font-mono-c placeholder-green-300"
                    placeholder="e.g. Sedan, SUV..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (modal.type === "add" ? handleAdd() : handleEdit())
                    }
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-green-200 text-sm text-green-600 hover:bg-green-50 transition-colors font-mono-c"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modal.type === "add" ? handleAdd : handleEdit}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors font-mono-c"
                  >
                    {modal.type === "add" ? "Add Category" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Delete */}
            {modal.type === "delete" && (
              <div className="p-6">
                <div className="text-3xl mb-3">{modal.data.icon}</div>
                <h3 className="font-display text-lg font-bold mb-1 text-green-900">
                  Delete "{modal.data.name}"?
                </h3>
                <p className="text-sm mb-4 font-mono-c text-green-600">
                  This will remove it from all ride type mappings.
                </p>
                {deleteError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4 font-mono-c">
                    ⚠️ {deleteError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-green-200 text-sm text-green-600 hover:bg-green-50 transition-colors font-mono-c"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors font-mono-c"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Mapping */}
            {modal.type === "mapping" &&
              (() => {
                const rt = rideTypes.find((r) => r.id === modal.data.id);
                return (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <h3 className="font-display text-lg font-bold text-green-900">
                        {rt.label} — Map Categories
                      </h3>
                    </div>
                    <p className="text-xs mb-5 font-mono-c text-green-500">
                      Select which vehicle types belong to this ride tier
                    </p>
                    <div className="space-y-2 mb-6">
                      {categories.map((cat) => {
                        const mapped = rt.mappedCategoryIds.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => toggleMapping(rt.id, cat.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                              mapped
                                ? "bg-green-50 border-green-400"
                                : "bg-white border-green-100 hover:border-green-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{cat.icon}</span>
                              <span className="text-sm font-medium text-green-900">
                                {cat.name}
                              </span>
                              {cat.activeDrivers > 0 && (
                                <span className="text-[10px] font-mono-c text-green-400">
                                  {cat.activeDrivers} drivers
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] transition-all font-bold ${
                                mapped
                                  ? "bg-green-600 border-green-600 text-white"
                                  : "border-green-300"
                              }`}
                            >
                              {mapped && "✓"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        setModal(null);
                        showToast(`${rt.label} mapping updated`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors font-mono-c"
                    >
                      Save Mapping
                    </button>
                  </div>
                );
              })()}
          </div>
        </div>
      )}
    </div>
  );
}
