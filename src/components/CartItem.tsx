
import React, { useState } from "react";
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

  console.log(item)

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
              className="w-16 px-2 py-1 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              value={item.quantity === 0 ? "" : item.quantity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  updateQuantity(item.id, 0); // or handle empty case gracefully
                } else {
                  const numberValue = parseFloat(value);
                  if (!isNaN(numberValue)) {
                    updateQuantity(item.id, numberValue);
                  }
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
            className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-right"
            value={item.actual_selling_price || item.selling_price || 0}
            onChange={(e) => updateSellingPrice(item.id, parseFloat(e.target.value) || 0)}
            min="1"
          />
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Subtotal:</span>
          <span className="font-bold text-teal-600">UGX {subtotal.toFixed(2)}</span>
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
