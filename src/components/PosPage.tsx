
import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingCart, Search, Plus, Minus, X, CreditCard, User, Package, Filter } from 'lucide-react';

// Mock data and interfaces for the demo
interface CartItemType {
  id: number;
  item_id: number;
  name: string;
  selling_price: string;
  actual_selling_price: number;
  quantity: number;
  discount: number;
  unit_of_measure?: {
    abbreviation: string;
  };
  item_images: Array<{
    image_url: string;
  }>;
}

// Mock components to replace the imports
const PosItemCard: React.FC<{
  image: string;
  name: string;
  price: number;
  addItem: () => void;
  item: any;
  isMobile?: boolean;
}> = ({ image, name, price, addItem, item, isMobile = false }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 group ${
        isMobile ? "w-full" : "w-full"
      }`}
      onClick={addItem}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            UGX {price}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {item?.unit_of_measure?.abbreviation || 'unit'}
          </span>
        </div>
      </div>
    </div>
  );
};

const CartItem: React.FC<{
  item: CartItemType;
  updateQuantity: (id: number, quantity: number) => void;
  updateSellingPrice: (id: number, price: number) => void;
  updateDiscount: (id: number, discount: number) => void;
  removeItemFromCart: (id: number) => void;
  isMobile?: boolean;
}> = ({ item, updateQuantity, updateSellingPrice, updateDiscount, removeItemFromCart, isMobile = false }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800 flex-1 mr-2">{item.name}</h4>
        <button
          onClick={() => removeItemFromCart(item.id)}
          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Price:</span>
          <input
            type="number"
            value={item.actual_selling_price}
            onChange={(e) => updateSellingPrice(item.id, parseFloat(e.target.value) || 0)}
            className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Discount:</span>
          <input
            type="number"
            value={item.discount}
            onChange={(e) => updateDiscount(item.id, parseFloat(e.target.value) || 0)}
            className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Subtotal:</span>
            <span className="font-bold text-blue-600">
              UGX {((item.quantity * item.actual_selling_price) - (item.discount * item.quantity)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryNav: React.FC<{
  selectedCategory: number | string;
  onSelectCategory: (category: number | string) => void;
  isMobile?: boolean;
}> = ({ selectedCategory, onSelectCategory, isMobile = false }) => {
  const categories = [
    { id: 0, name: 'All Items' },
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Food & Drinks' },
    { id: 4, name: 'Home & Garden' },
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

const PaymentComponent: React.FC<{
  setClientName: (name: string | number | null) => void;
  paymentMethod: string | null;
  setPaymentMethod: (method: string | null) => void;
  isMobile?: boolean;
}> = ({ setClientName, paymentMethod, setPaymentMethod, isMobile = false }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
        <input
          type="text"
          onChange={(e) => setClientName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter customer name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <select
          value={paymentMethod || ''}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select payment method</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile">Mobile Money</option>
        </select>
      </div>
    </div>
  );
};

const PosPage = () => {
  // Mock data - replace with your actual data fetching
  const items: CartItemType[] = [
    {
      id: 1,
      item_id: 1,
      name: "Premium Coffee Beans",
      selling_price: "25000",
      actual_selling_price: 25000,
      quantity: 0,
      discount: 0,
      unit_of_measure: { abbreviation: "kg" },
      item_images: []
    },
    {
      id: 2,
      item_id: 2,
      name: "Wireless Headphones",
      selling_price: "150000",
      actual_selling_price: 150000,
      quantity: 0,
      discount: 0,
      unit_of_measure: { abbreviation: "pcs" },
      item_images: []
    },
    {
      id: 3,
      item_id: 3,
      name: "Organic Tea Leaves",
      selling_price: "18000",
      actual_selling_price: 18000,
      quantity: 0,
      discount: 0,
      unit_of_measure: { abbreviation: "box" },
      item_images: []
    },
    {
      id: 4,
      item_id: 4,
      name: "Smartphone Case",
      selling_price: "35000",
      actual_selling_price: 35000,
      quantity: 0,
      discount: 0,
      unit_of_measure: { abbreviation: "pcs" },
      item_images: []
    }
  ];

  const businessName = "Demo Store";
  const [selectedCategory, setSelectedCategory] = useState<number | string>(0);
  const [customer, setCustomer] = useState<string | number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>("");
  const [searchedItems, setSearchedItems] = useState<CartItemType[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [query, setQuery] = useState("");

  // Mock user data
  const user = {
    id: 1,
    first_name: "Demo",
    full_name: "Demo User"
  };

  const isMobile = window.innerWidth < 768;

  const contentRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== 0) {
      result = result.filter(
        (item) => item.item_id === selectedCategory
      );
    }
    return result;
  }, [items, selectedCategory]);

  useEffect(() => {
    if (query.trim() !== "") {
      const result = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchedItems(result);
    } else {
      setSearchedItems(filteredItems);
    }
  }, [query, items, filteredItems]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(searchedItems.length / itemsPerPage);
  const paginatedItems = searchedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const addItemToCart = (item: CartItemType) => {
    setCart((prev) => {
      const exists = prev.find((cartItem) => cartItem.id === item.id);
      if (exists) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          discount: 0,
          actual_selling_price: Math.floor(+item.selling_price),
        },
      ];
    });
  };

  const removeItemFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const updateSellingPrice = (id: number, selling_price: number) => {
    if (selling_price < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, actual_selling_price: selling_price } : item
      )
    );
  };

  const updateDiscount = (id: number, discount: number) => {
    if (discount < 0) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, discount } : item))
    );
  };

  const totalAmount = useMemo(() => {
    const result = cart.reduce((sum, item) => {
      return (
        sum +
        item.quantity * parseFloat(item.actual_selling_price.toString()) -
        item.discount * item.quantity
      );
    }, 0);
    setTotal(result);
    return result;
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items to checkout.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const processCheckout = async (printReceipt: boolean) => {
    // Mock checkout process
    console.log("Processing checkout...", {
      cart,
      customer,
      paymentMethod,
      total: totalAmount
    });
    
    setShowConfirmationModal(false);
    setCart([]);
    alert("Order completed successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">POS System</h1>
                <p className="text-sm text-gray-500">{businessName}</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.full_name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} h-[calc(100vh-80px)]`}>
        {/* Products Section */}
        <div className={`${isMobile ? "w-full" : "w-3/5"} flex flex-col bg-white border-r border-gray-200`}>
          {/* Category Filter */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Products</h2>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isMobile={isMobile}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {paginatedItems.length > 0 ? (
              <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4"} gap-6`}>
                {paginatedItems.map((item) => (
                  <PosItemCard
                    key={item.item_id}
                    image=""
                    name={item.name}
                    item={item}
                    price={Math.floor(+item.selling_price)}
                    addItem={() => addItemToCart(item)}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Package className="w-16 h-16 mb-4" />
                <p className="text-lg">No items found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className={`${isMobile ? "w-full" : "w-2/5"} flex flex-col bg-gradient-to-b from-gray-50 to-white`}>
          <div className="flex-1 flex flex-col">
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {cart.length} items
                </div>
              </div>
              <p className="text-sm text-gray-600">Review your order before checkout</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <CartItem
                    key={item.item_id}
                    item={item}
                    updateQuantity={updateQuantity}
                    updateSellingPrice={updateSellingPrice}
                    updateDiscount={updateDiscount}
                    removeItemFromCart={removeItemFromCart}
                    isMobile={isMobile}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add items to get started</p>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Total Amount:</span>
                  <span className="font-bold text-2xl text-blue-600">
                    UGX {totalAmount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    cart.length > 0 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {cart.length > 0 ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to Checkout</span>
                    </div>
                  ) : (
                    "Add items to checkout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Confirm Order</h2>

              <PaymentComponent
                setClientName={setCustomer}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isMobile={isMobile}
              />

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>UGX {((item.quantity * item.actual_selling_price) - (item.discount * item.quantity)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-100">
                  <span>Total:</span>
                  <span className="text-blue-600">UGX {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className={`flex ${isMobile ? "flex-col space-y-3" : "space-x-3"} mt-8`}>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => processCheckout(false)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
                >
                  Complete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosPage;
