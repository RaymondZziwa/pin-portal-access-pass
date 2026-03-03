import React from 'react';
import useWarehouses from "@/hooks/useWarehouses";

interface SelectionModalProps {
  show: boolean;
  warehouse: string;
  warehouseError: string;
  onWarehouseChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onConfirm: () => void;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
  show,
  warehouse,
  warehouseError,
  onWarehouseChange,
  onConfirm
}) => {
  const { data: warehouses } = useWarehouses();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Required Settings
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Please select a store to continue using the POS system.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store
            </label>
            <select
              value={warehouse}
              onChange={onWarehouseChange}
              className={`w-full p-3 border rounded-md ${
                warehouseError ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">Select store</option>
              {warehouses.filter((warehouse) => warehouse.warehouse_type === 'sales_store').map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {warehouseError && (
              <p className="mt-1 text-sm text-red-600">{warehouseError}</p>
            )}
            {warehouses.filter((warehouse) => warehouse.warehouse_type === 'sales_store').length === 0 && (
              <p className="mt-1 text-sm text-red-600">No sales stores available.</p>
            )}
          </div>

          <button
            onClick={onConfirm}
            className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-800 text-white rounded-xl font-medium transition-all transform hover:scale-105 mt-4"
          >
            Confirm Selections
          </button>
        </div>
      </div>
    </div>
  );
};