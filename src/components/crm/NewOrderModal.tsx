import { formatNaira } from "@/data/store";
import { useFormik } from "formik";
import * as Yup from 'yup';

type Props = {
  closeModal: () => void;
  editing: boolean;
  submit: () => Promise<boolean>;
  data: any; // TODO: refine this later
};

const schema  = Yup.object({
  
});

const Modal: React.FC<Props> = ({ closeModal, editing, submit, data }) => {

  const formik = useFormik({
    initialValues: {
      
    },
    validationSchema: 
    onSubmit: async () => {
      
    }
  });
  
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => closeModal()}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900">
            {editing ? "Edit Order" : "New Order"}
          </h3>
          <button onClick={() => closeModal()} className="text-gray-400">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <input
                className="input-field"
                value={form.customerName || ""}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                className="input-field"
                value={form.phoneNumber || ""}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder="+234"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                className="input-field"
                value={form.whatsappNumber || ""}
                onChange={(e) =>
                  setForm({ ...form, whatsappNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Deal Type
              </label>
              <select
                className="input-field"
                value={form.dealType || "retail"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dealType: e.target.value as Order["dealType"],
                  })
                }
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="dm">DM/Group</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          {ci && (
            <div
              className={`rounded-lg p-3 text-xs ${ci.type === "return" ? "bg-green-50 border border-green-200 text-green-700" : "bg-orange-50 border border-orange-200 text-orange-700"}`}
            >
              {ci.type === "return" ? (
                <>
                  <UserCheck size={14} className="inline" />{" "}
                  <strong>Return!</strong> #{ci.prevOrder}
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="inline" />{" "}
                  <strong>Unconverted</strong>
                </>
              )}
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                className="input-field"
                value={form.deliveryAddress || ""}
                onChange={(e) =>
                  setForm({ ...form, deliveryAddress: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                className="input-field"
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                className="input-field"
                value={form.state || ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Order Date
              </label>
              <input
                className="input-field"
                type="date"
                value={form.orderDate || ""}
                onChange={(e) =>
                  setForm({ ...form, orderDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expected Delivery
              </label>
              <input
                className="input-field"
                type="date"
                value={form.expectedDeliveryDate || ""}
                onChange={(e) =>
                  setForm({ ...form, expectedDeliveryDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Items</h4>
              <div className="flex items-center gap-2">
                <select
                  className="input-field text-xs py-1 w-auto"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                >
                  {products.length > 0 &&
                    products[0].tiers.length > 0 &&
                    products[0].tiers.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={addItem}
                  className="btn-secondary text-xs py-1 px-2"
                >
                  <Plus size={12} className="inline" /> Add
                </button>
              </div>
            </div>
            {orderItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No items</p>
            ) : (
              <div className="space-y-2">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <select
                        className="input-field flex-1 text-xs"
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(idx, "productId", e.target.value)
                        }
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className="input-field w-24 text-xs"
                        value={item.tierName}
                        onChange={(e) =>
                          updateItem(idx, "tierName", e.target.value)
                        }
                      >
                        {products
                          .find((p) => p.id === item.productId)
                          ?.tiers.map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                      </select>
                      <input
                        type="number"
                        className="input-field w-16 text-xs"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", Number(e.target.value))
                        }
                        min={1}
                      />
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {isCEO && (
                      <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                        <span>
                          Cost: {formatNaira(item.costPrice * item.quantity)}
                        </span>
                        <span>
                          Sell: {formatNaira(item.unitPrice * item.quantity)}
                        </span>
                        <span className="text-green-600">
                          +
                          {formatNaira(
                            (item.unitPrice - item.costPrice) * item.quantity,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {isCEO && (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex justify-between text-xs font-semibold text-green-600">
                      <span>Profit:</span>
                      <span>
                        {formatNaira(
                          calculateTotals().totalAmount -
                            calculateTotals().totalCost,
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="border-t pt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment
              </label>
              <select
                className="input-field"
                value={form.paymentStatus || "unpaid"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentStatus: e.target.value as Order["paymentStatus"],
                  })
                }
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount Paid (₦)
              </label>
              <input
                className="input-field"
                type="number"
                value={form.amountPaid || ""}
                onChange={(e) =>
                  setForm({ ...form, amountPaid: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
          <button onClick={() => closeModal()} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={save}
            className="btn-primary flex-1"
            style={{ backgroundColor: brand.primaryColor }}
          >
            {editing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
