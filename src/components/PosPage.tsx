import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingCart, Search, Plus, CreditCard, User, Package, Filter, LogOut, Coins, Warehouse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import { PrintableContent } from './PrintableContent';
import useItemCategories from "@/hooks/useCategories";
import useItems from "@/hooks/useItems";
import { apiRequest, baseURL, imageURL } from "@/lib/api";
import useWarehouses from "@/hooks/useWarehouses";
import useCurrencies from "@/hooks/useCurrencies";
import usePaymentMethods from "@/hooks/usePaymentMethods";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { toast, Toaster } from "sonner";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

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
      className={`h-48 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 group ${
        isMobile ? "w-full" : "w-full"
      }`}
      onClick={addItem}
    >
      <div className="relative overflow-hidden h-2/3 w-full">
        <img
          src={
            item.item_images?.[0]?.image_url
              ? `${imageURL}/${item.item_images[0].image_url}`
              : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
          }
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      <div className="p-2">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-teal-600">UGX {price}</span>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {item?.unit_of_measure?.abbreviation || "unit"}
          </span>
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
  const {data: categories} = useItemCategories()

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'bg-teal-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
       <button
          onClick={() => onSelectCategory(0)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200`}
        >
          All
        </button>
    </div>
  );
};

const PaymentComponent: React.FC<{
  setClientName: (name: string | number | null) => void;
  paymentMethod: string | null;
  setPaymentMethod: (method: string | null) => void;
  isMobile?: boolean;
}> = ({ setClientName, paymentMethod, setPaymentMethod, isMobile = false }) => {
  const {data: pms} = usePaymentMethods()
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
        <input
          type="text"
          onChange={(e) => setClientName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter customer name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="" disabled>Select Payment Method</option>
          {pms.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Device detection functions
const isWebBluetoothSupported = (): boolean => {
  return !!(navigator.bluetooth && navigator.bluetooth.requestDevice);
};

const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const PosPage = () => {
  const navigate = useNavigate();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [warehouseError, setWarehouseError] = useState("");
  const [currencyError, setCurrencyError] = useState("");
  const [showPrinterHelp, setShowPrinterHelp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const checkSelections = () => {
      const hasWarehouse = localStorage.getItem("selectedWarehouse");
      
      if (!hasWarehouse) {
        setShowSelectionModal(true);
      }
    };

    checkSelections();
  }, []);
  
  // Auto-logout functionality
  const AUTO_LOGOUT_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds
  
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('user');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Set up activity tracking and auto-logout
    let timeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      localStorage.setItem('lastActivity', Date.now().toString());
      timeoutId = setTimeout(() => {
        handleLogout();
      }, AUTO_LOGOUT_TIME);
    };

    const checkActivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > AUTO_LOGOUT_TIME) {
          handleLogout();
          return;
        }
      }
      resetTimeout();
    };

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    checkActivity();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear()
    navigate('/');
  };

  const businessName = "Sahara Spice Hub";
  const {data: items} = useItems()
  const [selectedCategory, setSelectedCategory] = useState<number | string>(0);
  const [customer, setCustomer] = useState<string | number | null>(null);
  const [searchedItems, setSearchedItems] = useState<CartItemType[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [query, setQuery] = useState("");
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { data: warehouses } = useWarehouses()
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const { data: currencies } = useCurrencies()
  const [warehouse, setWarehouse] = useState(() => localStorage.getItem("selectedWarehouse") || "");
  const [currency, setCurrency] = useState(() => localStorage.getItem("selectedCurrency") || "");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("");

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setWarehouse(value);
    localStorage.setItem("selectedWarehouse", value);
    localStorage.setItem("selectedCurrency", user?.base_currency?.id || "");
    if (value) setWarehouseError("");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCurrency(value);
    if (value) setCurrencyError("");
  };

  const validateSelections = () => {
    let isValid = true;
    
    if (!warehouse) {
      setWarehouseError("Please select a warehouse");
      isValid = false;
    }
    
    return isValid;
  };

  const confirmSelections = () => {
    if (validateSelections()) {
      setShowSelectionModal(false);
    }
  };

  const isMobile = window.innerWidth < 768;

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== 0) {
      result = result.filter(
        (item) => item.item_category_id === selectedCategory
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
  const payload = {
    cashier_id: user.user?.id,
    cashier_name: `${user.user?.first_name || ''} ${user.user?.last_name || ''}`,
    customer_id: 0,
    customer_name: customer || "",
    warehouse_id: localStorage.getItem("selectedWarehouse"),
    items: cart.map(item => ({
      item_id: item.id.toString(),
      quantity: item.quantity,
      discount: item.discount
    })),
    payment_method_id: paymentMethod || "db1c6e65-ca5d-4637-9edb-1e56f189145c",
    amount_paid: 0,
    sale_date: new Date().toLocaleDateString('en-US'),
    currency_id: localStorage.getItem("selectedCurrency"),
    amount: totalAmount,
    is_print:printReceipt
  };

  try {
    setIsPrinting(true);
    
    // Process the sale
 const saleResponse = await axios.post(
    `${baseURL}/inventories/pointsofsale`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      responseType: "blob", // ✅ important if backend returns a PDF
    }
  );

  // If backend returns JSON + PDF sometimes
  if (saleResponse.headers["content-type"]?.includes("application/json")) {
    const json = await saleResponse.data.text();
    const parsed = JSON.parse(json);
    toast.success(parsed.message);
  }

  // ✅ Treat response as blob for PDF download
  if (saleResponse.data) {
    const blob = new Blob([saleResponse.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    // Open in new tab
    window.open(url, "_blank");

    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  } else {
    // Fallback to react-to-print
    setTimeout(() => {
      if (contentRef.current) {
        reactToPrintFn();
      }
    }, 500);
  }

  // ✅ Clear cart and close modal
  setCart([]);
  setShowConfirmationModal(false);
    
  } catch (error: any) {
    console.error("Checkout failed:", error);
    toast.error(error?.response?.data?.message || "Checkout failed. Please try again.");
  } finally {
    setIsPrinting(false);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      {showSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Required Settings
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Please select a warehouse and currency to continue using the POS system.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse
                </label>
                <select
                  value={warehouse}
                  onChange={handleWarehouseChange}
                  className={`w-full p-3 border rounded-md ${
                    warehouseError ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {warehouseError && (
                  <p className="mt-1 text-sm text-red-600">{warehouseError}</p>
                )}
              </div>

              <button
                onClick={confirmSelections}
                className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-800 text-white rounded-xl font-medium transition-all transform hover:scale-105 mt-4"
              >
                Confirm Selections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printer Help Modal */}
      {showPrinterHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Printer Setup</h3>
            {isMobileDevice() ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">For Android Tablets:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Install RawBT Printer app from Play Store</li>
                    <li>Open RawBT and grant all permissions</li>
                    <li>Enable "Web Server" in RawBT settings</li>
                    <li>Pair your Bluetooth printer in Android settings</li>
                    <li>Keep RawBT running in background</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">For Desktop:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Make sure Bluetooth printer is turned on</li>
                    <li>Ensure printer is paired with your computer</li>
                    <li>Grant Bluetooth permissions when prompted</li>
                  </ol>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowPrinterHelp(false)}
              className="w-full mt-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Toaster />
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">POS</h1>
                <p className="text-sm text-gray-500">{businessName}</p>
              </div>
            </div>

            <div className="flex-1 max-w-2xl mx-8 flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Warehouse className="w-5 h-5 text-gray-500" />
                <select
                  disabled 
                  value={warehouse}
                  onChange={handleWarehouseChange}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="" disabled>Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.first_name} {user.last_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} h-[calc(100vh-80px)]`}>
        {/* Products Section */}
        <div className={`${isMobile ? "w-full" : "w-3/5"} flex flex-col bg-white border-r border-gray-200`}>
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
                <span className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-sm font-medium">
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
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                <div className="bg-teal-100 text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
                  {cart.length} items
                </div>
              </div>
              <p className="text-sm text-gray-600">Review your order before checkout</p>
            </div>

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

            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Total Amount:</span>
                  <span className="font-bold text-2xl text-teal-600">
                    UGX {totalAmount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    cart.length > 0 
                      ? "bg-teal-500 hover:bg-teal-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
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
                  <span className="text-teal-600">UGX {totalAmount.toFixed(2)}</span>
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
                  disabled={isPrinting}
                  className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-800 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {isPrinting ? 'Processing...' : 'Complete Order'}
                </button>
                <button
                  onClick={() => processCheckout(true)}
                  disabled={isPrinting}
                  className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-800 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {isPrinting ? 'Printing...' : 'Complete & Print'}
                </button>
              </div>
              <button
                onClick={() => setShowPrinterHelp(true)}
                className="w-full text-xs text-blue-600 hover:text-blue-800 underline mt-4"
              >
                Printer not working?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Content */}
      <div ref={contentRef} className="print-content">
        <PrintableContent
          paymentMethod={paymentMethod}
          servedBy={`${user.user?.first_name || ''} ${user.user?.last_name || ''}`}
          total={totalAmount}
          cart={cart}
          businessName={businessName}
          isMobile={isMobile}
        />
        <style>
          {`
            @media print {
              .print-content { display: block !important; }
            }
            .print-content { display: none; }
          `}
        </style>
      </div>
    </div>
  );
};

export default PosPage;