import { useState, useMemo } from "react";
import { useFormik } from "formik";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useBrand } from "../context/BrandContext";
import { formatNaira } from "../data/store";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/data/queries";
import { useAuth } from "@/context/AuthContext";

export interface PriceTier {
  name: string;
  costPrice: number;
  sellingPrice: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  benefits?: string;
  status: "in-stock" | "out-of-stock";
  totalStock: number;
  tiers: PriceTier[];
}

interface ProductFormValues {
  name: string;
  category: string;
  imageUrl: string;
  benefits: string;
  tiers: PriceTier[];
}

const DEFAULT_TIERS: PriceTier[] = [
  { name: "Retail", costPrice: 0, sellingPrice: 0 },
  { name: "Wholesale", costPrice: 0, sellingPrice: 0 },
  { name: "DM/Group", costPrice: 0, sellingPrice: 0 },
];

export default function Products() {
  const { brand } = useBrand();
  const { user } = useAuth();
  const companyId = user?.companyId as string;

  // React Query Hooks
  const {
    data: products = [],
    isLoading: loadingProducts,
    error: productsError,
  } = useProducts(companyId);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Filter & UI States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Custom Tier State for Modal
  const [customTier, setCustomTier] = useState<PriceTier>({
    name: "",
    costPrice: 0,
    sellingPrice: 0,
  });

  // Categories & Filtering
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" || p.status === filter || p.category === filter;
      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  // Formik Configuration
  const formik = useFormik<ProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: editing?.name ?? "",
      category: editing?.category ?? "",
      imageUrl: editing?.imageUrl ?? "",
      benefits: editing?.benefits ?? "",
      tiers: editing?.tiers ? [...editing.tiers] : DEFAULT_TIERS,
    },
    onSubmit: async (values) => {
      if (!companyId) return;

      const stock = editing?.totalStock ?? 0;
      const status: Product["status"] =
        stock === 0 ? "out-of-stock" : "in-stock";

      const payload = {
        ...values,
        imageUrl: values.imageUrl || undefined,
        benefits: values.benefits || undefined,
      };

      if (editing) {
        await updateProductMutation.mutateAsync({
          companyId,
          id: editing.id,
          data: {
            ...payload,
            status,
          },
        });
      } else {
        await createProductMutation.mutateAsync({
          companyId,
          data: {
            ...payload,
            totalStock: 0,
            status: "in-stock",
          },
        });
      }

      closeModal();
    },
  });

  // Tier Helpers
  const handleUpdateTier = (
    index: number,
    field: keyof PriceTier,
    value: string | number,
  ) => {
    const updated = [...formik.values.tiers];
    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? value : Number(value),
    };
    formik.setFieldValue("tiers", updated);
  };

  const handleRemoveTier = (index: number) => {
    formik.setFieldValue(
      "tiers",
      formik.values.tiers.filter((_, i) => i !== index),
    );
  };

  const resetCustomTier = () => {
    setCustomTier({ name: "", costPrice: 0, sellingPrice: 0 });
  };

  const handleAddCustomTier = () => {
    const tierName = customTier.name.trim();
    if (!tierName) return;

    const newTier: PriceTier = {
      name: tierName,
      costPrice: Number(customTier.costPrice) || 0,
      sellingPrice: Number(customTier.sellingPrice) || 0,
    };

    formik.setFieldValue("tiers", [...formik.values.tiers, newTier]);
    resetCustomTier();
  };

  // UI Handlers
  const openAddModal = () => {
    setEditing(null);
    resetCustomTier();
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditing(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    resetCustomTier();
    formik.resetForm();
  };

  const handleRemoveProduct = async (id: string) => {
    if (!companyId) return;
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProductMutation.mutateAsync({ companyId, id });
    }
  };

  const getProfitPercent = (sellingPrice: number, costPrice: number) => {
    if (costPrice <= 0) return "0";
    return (((sellingPrice - costPrice) / costPrice) * 100).toFixed(0);
  };

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-red-600">
          Could not load products. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
          style={{ backgroundColor: brand.primaryColor }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card overflow-hidden">
            <div
              className="p-4 flex items-center gap-4 cursor-pointer"
              onClick={() =>
                setExpandedId(expandedId === product.id ? null : product.id)
              }
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${brand.primaryColor}15` }}
                >
                  <Package size={20} style={{ color: brand.primaryColor }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {product.name}
                  </h4>
                  <span
                    className={`badge text-[10px] ${
                      product.status === "in-stock"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {product.category} • {product.tiers.length} price tiers
                </p>
              </div>

              <div className="text-right hidden sm:block">
                {product.tiers
                  .filter((t) => t.name === "Retail")
                  .map((t) => (
                    <p key="retail" className="text-sm font-bold text-gray-900">
                      {formatNaira(t.sellingPrice)}
                    </p>
                  ))}
                <p className="text-xs text-gray-500">
                  Stock: {product.totalStock}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(product);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveProduct(product.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
                {expandedId === product.id ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Accordion Content */}
            {expandedId === product.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {product.benefits && (
                  <div className="mt-3 mb-2 bg-green-50 rounded-lg p-3">
                    <p className="text-[10px] text-green-600 uppercase font-semibold mb-1">
                      Benefits
                    </p>
                    <p className="text-xs text-green-800">{product.benefits}</p>
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-500 uppercase mt-3 mb-2">
                  Pricing Tiers (Cost vs Selling)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {product.tiers.map((tier, i) => {
                    const profit = tier.sellingPrice - tier.costPrice;
                    const pct = getProfitPercent(
                      tier.sellingPrice,
                      tier.costPrice,
                    );
                    const borderColors = [
                      "border-l-green-500",
                      "border-l-blue-500",
                      "border-l-purple-500",
                      "border-l-amber-500",
                      "border-l-pink-500",
                      "border-l-cyan-500",
                    ];
                    return (
                      <div
                        key={i}
                        className={`bg-gray-50 rounded-lg p-3 border-l-4 ${
                          borderColors[i % borderColors.length]
                        }`}
                      >
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          {tier.name}
                        </p>
                        <div className="flex items-baseline justify-between mt-1">
                          <p className="text-lg font-bold text-gray-900">
                            {formatNaira(tier.sellingPrice)}
                          </p>
                          <p className="text-xs text-green-600 font-semibold">
                            +{formatNaira(profit)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-gray-400">
                            Cost: {formatNaira(tier.costPrice)}
                          </span>
                          <span className="text-green-600 font-medium">
                            ({pct}% margin)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="card p-8 text-center">
          <Package size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No products found.</p>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b bg-white">
              <h3 className="font-semibold text-gray-900">
                {editing ? "Edit Product" : "Add Product"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="flex-1 overflow-y-auto flex flex-col"
            >
              <div className="p-5 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      className="input-field"
                      {...formik.getFieldProps("name")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      className="input-field"
                      {...formik.getFieldProps("category")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image URL (optional)
                    </label>
                    <input
                      className="input-field"
                      placeholder="https://example.com/product.jpg"
                      {...formik.getFieldProps("imageUrl")}
                    />
                    {formik.values.imageUrl && (
                      <img
                        src={formik.values.imageUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-lg object-cover mt-2"
                      />
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Benefits (for invoice)
                    </label>
                    <textarea
                      className="input-field text-sm"
                      rows={2}
                      placeholder="e.g. Moisturizes skin, Anti-aging, Natural ingredients..."
                      {...formik.getFieldProps("benefits")}
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      These benefits will appear on the customer invoice
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Price Tiers (Each has its own Cost & Selling Price)
                  </h4>
                  {formik.values.tiers.map((tier, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          className="input-field w-28 text-sm font-semibold"
                          value={tier.name}
                          onChange={(e) =>
                            handleUpdateTier(i, "name", e.target.value)
                          }
                          placeholder="Tier name"
                        />
                        {i >= 3 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(i)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase">
                            Cost Price (₦)
                          </label>
                          <input
                            className="input-field text-sm"
                            type="number"
                            value={tier.costPrice || ""}
                            onChange={(e) =>
                              handleUpdateTier(i, "costPrice", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase">
                            Selling Price (₦)
                          </label>
                          <input
                            className="input-field text-sm"
                            type="number"
                            value={tier.sellingPrice || ""}
                            onChange={(e) =>
                              handleUpdateTier(
                                i,
                                "sellingPrice",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      {tier.costPrice > 0 && tier.sellingPrice > 0 && (
                        <p className="text-[10px] text-green-600 mt-1">
                          Profit:{" "}
                          {formatNaira(tier.sellingPrice - tier.costPrice)} (
                          {getProfitPercent(tier.sellingPrice, tier.costPrice)}%
                          margin)
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Add Custom Tier
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        className="input-field text-sm"
                        placeholder="Tier name"
                        value={customTier.name}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomTier();
                          }
                        }}
                        onChange={(e) =>
                          setCustomTier({
                            ...customTier,
                            name: e.target.value,
                          })
                        }
                      />
                      <input
                        className="input-field text-sm"
                        type="number"
                        placeholder="Cost (₦)"
                        value={customTier.costPrice || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomTier();
                          }
                        }}
                        onChange={(e) =>
                          setCustomTier({
                            ...customTier,
                            costPrice: Number(e.target.value),
                          })
                        }
                      />
                      <div className="flex gap-1">
                        <input
                          className="input-field text-sm flex-1"
                          type="number"
                          placeholder="Sell (₦)"
                          value={customTier.sellingPrice || ""}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomTier();
                            }
                          }}
                          onChange={(e) =>
                            setCustomTier({
                              ...customTier,
                              sellingPrice: Number(e.target.value),
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomTier}
                          disabled={!customTier.name.trim()}
                          className="btn-secondary px-3 text-xs disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                  className="btn-primary flex-1 disabled:opacity-50"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {editing ? "Update" : "Add"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
