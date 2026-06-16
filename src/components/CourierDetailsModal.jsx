import React from 'react';

const CourierDetailsModal = ({ open, form, onChange, onClose, onSubmit }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold text-maroon">Courier Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate hover:text-maroon"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="px-4 py-3 space-y-3 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Recipient Name *</label>
              <input
                name="recipientName"
                value={form.recipientName}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Recipient Phone *</label>
              <input
                name="recipientPhone"
                value={form.recipientPhone}
                onChange={onChange}
                className="input-field"
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Recipient Email</label>
              <input
                name="recipientEmail"
                value={form.recipientEmail}
                onChange={onChange}
                className="input-field"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Alternate Phone</label>
              <input
                name="alternatePhone"
                value={form.alternatePhone}
                onChange={onChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate mb-2">Address Line *</label>
            <input
              name="addressLine"
              value={form.addressLine}
              onChange={onChange}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Union *</label>
              <input
                name="union"
                value={form.union}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Sub-district *</label>
              <input
                name="subDistrict"
                value={form.subDistrict}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">District *</label>
              <input
                name="district"
                value={form.district}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Division *</label>
              <input
                name="division"
                value={form.division}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">City</label>
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Postal Code *</label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate mb-2">Item Description *</label>
            <textarea
              name="itemDescription"
              value={form.itemDescription}
              onChange={onChange}
              className="input-field"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Weight (kg) *</label>
              <input
                name="weightKg"
                value={form.weightKg}
                onChange={onChange}
                className="input-field"
                type="number"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Delivery Type *</label>
              <select
                name="deliveryType"
                value={form.deliveryType}
                onChange={onChange}
                className="input-field"
                required
              >
                <option value="home">Home Delivery</option>
                <option value="point">Point Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Parcel Value</label>
              <input
                name="parcelValue"
                value={form.parcelValue}
                onChange={onChange}
                className="input-field"
                type="number"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">COD Amount</label>
              <input
                name="codAmount"
                value={form.codAmount}
                onChange={onChange}
                className="input-field"
                type="number"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate mb-2">Invoice</label>
              <input
                name="invoice"
                value={form.invoice}
                onChange={onChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate mb-2">Note</label>
            <textarea
              name="note"
              value={form.note}
              onChange={onChange}
              className="input-field"
              rows={2}
            />
          </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate/30">
              Cancel
            </button>
            <button type="submit" className="btn-primary px-6 py-2">
              Send to Courier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourierDetailsModal;
