
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X, Minus, Plus } from 'lucide-react';

interface CartItemProps {
  item: any;
  updateSellingPrice: (id: number, price: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateDiscount: (id: number, discount: number) => void;
  removeItemFromCart: (id: number) => void;
  isMobile?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  updateSellingPrice, 
  updateQuantity,
  updateDiscount,
  removeItemFromCart,
  isMobile = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currency = JSON.parse(localStorage.getItem('user') || '').user.organisation.base_currency.code;
const [tempPrice, setTempPrice] = useState(
  item.actual_selling_price ?? item.selling_price ?? ""
);

useEffect(() => {
  // Keep tempPrice in sync when the item changes
  setTempPrice(item.actual_selling_price ?? item.selling_price ?? "");
}, [item.actual_selling_price, item.selling_price]);

  const subtotal = (item.quantity * item.actual_selling_price) - (item.discount * item.quantity);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Main Item Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex-1 text-sm">{item.item.name}</h4>
          <button
            onClick={() => removeItemFromCart(item.id)}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
  type="number"
  min={0}
  step="any"
  className="w-28 px-2 py-1 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
  value={item.quantity ?? ""}
  onChange={(e) => {
    const value = e.target.value;

    // Allow empty input
    if (value === "") {
      updateQuantity(item.id, "");
      return;
    }

    // Allow valid numeric strings, including partial ones like "0.", "0.0"
    if (!isNaN(Number(value))) {
      updateQuantity(item.id, value);
    }
  }}
  onBlur={() => {
    // Convert to number when user leaves the input
    if (item.quantity !== "" && !isNaN(Number(item.quantity))) {
      updateQuantity(item.id, Number(item.quantity));
    }
  }}
/>

            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 bg-teal-100 hover:bg-teal-200 text-teal-600 rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Price:</span>
            <input
    type="number"
    className="w-28 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-right"
    value={tempPrice}
    onChange={(e) => {
      const value = e.target.value;
      setTempPrice(value); // allow clearing field

      if (value === "") {
        // Don't immediately update parent with 0 — wait for blur
        return;
      }

      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
        updateSellingPrice(item.id, numberValue);
      }
    }}
    onBlur={() => {
      // When user leaves input, handle empty gracefully
      if (tempPrice === "") {
        setTempPrice(""); // visually stays empty
        updateSellingPrice(item.id, 0); // logical default
      }
    }}
    placeholder="0.00"
  />

        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Subtotal:</span>
          <span className="font-bold text-teal-600">{currency} {subtotal.toFixed(2)}</span>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 flex items-center justify-center space-x-2 text-sm text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>{isExpanded ? 'Less options' : 'More options'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Section for Discount */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Discount (per item):</span>
              <input
                type="number"
                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-right"
                value={item.discount}
                onChange={(e) => updateDiscount(item.id, parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItem;
