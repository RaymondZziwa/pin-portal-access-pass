import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingCart, Search, CreditCard, Package, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import { PrintableContent } from './PrintableContent';
import useItems from "@/hooks/useItems";
import { baseURL } from "@/lib/api";
import useWarehouses from "@/hooks/useWarehouses";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { toast, Toaster } from "sonner";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { CategoryNav } from "./categoryNav";
import { ConfirmationModal } from "./confirmationModal";
import { PosItemCard } from "./posItemCard";
import { SelectionModal } from "./selectionModal";
import { Header } from "./header";

interface CartItemType {
  id: number;
  item_id: number;
  name: string;
  price: number;
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
  item: any;
}

const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 2 minutes in milliseconds

const PosPage = () => {
  const navigate = useNavigate();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [warehouseError, setWarehouseError] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  // State
  const { data: items } = useItems();
  const [selectedCategory, setSelectedCategory] = useState<number | string>(0);
  const [customer, setCustomer] = useState<string | number | null>(null);
  const [searchedItems, setSearchedItems] = useState<CartItemType[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [query, setQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("");
  const [transactionId, setTransactionId] = useState<string | null>("");
  const [amountPaid, setAmountPaid] = useState<string | null>("");
  
  // Refs
  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // User data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { data: warehouses } = useWarehouses();
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  const [warehouse, setWarehouse] = useState(() => localStorage.getItem("selectedWarehouse") || "");
  
  const businessName = "Sahara Spice Hub";
  const isMobile = window.innerWidth < 768;

  // Effects
  useEffect(() => {
    const checkSelections = () => {
      const hasWarehouse = localStorage.getItem("selectedWarehouse");
      if (!hasWarehouse) {
        setShowSelectionModal(true);
      }
    };
    checkSelections();
  }, []);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('user');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        searchRef.current.blur();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Filtering and pagination
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== 0) {
      result = result.filter((item) => item.item_category_id === selectedCategory);
    }
    return result;
  }, [items, selectedCategory]);

  useEffect(() => {
    if (query.trim() !== "") {
      const result = items.filter((item) =>
        item.item.name.toLowerCase().includes(query.toLowerCase())
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

  // Cart functions
  const addItemToCart = (item: CartItemType) => {
    setCart((prev) => {
      const exists = prev.find((cartItem) => cartItem.item_id === item.item_id);
      if (exists) {
        return prev.map((cartItem) =>
          cartItem.item_id === item.item_id
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
          price: item.selling_price,
          actual_selling_price: Math.floor(+item.item.selling_price),
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

  // Handler functions
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setWarehouse(value);
    localStorage.setItem("selectedWarehouse", value);
    localStorage.setItem("selectedCurrency", user?.base_currency?.id || "");
    if (value) setWarehouseError("");
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

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items to checkout.");
      return;
    }
    setShowConfirmationModal(true);
  };

  const processCheckout = async (printReceipt: boolean) => {
    if (!amountPaid) {
      toast.error('Please enter amount paid');
      return;
    }
    const payload = {
      cashier_id: user.user?.id,
      cashier_name: `${user.user?.first_name || ''} ${user.user?.last_name || ''}`,
      customer_id: '',
      transaction_reference: transactionId,
      customer_name: customer || "",
      warehouse_id: localStorage.getItem("selectedWarehouse"),
      items: cart.map(item => ({
        item_id: item.item.id.toString(),
        quantity: item.quantity,
        discount: item.discount,
        price: item.actual_selling_price,
      })),
      payment_method_id: paymentMethod || "db1c6e65-ca5d-4637-9edb-1e56f189145c",
      amount_paid: parseInt(amountPaid),
      sale_date: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      currency_id: localStorage.getItem("selectedCurrency"),
      amount: totalAmount,
      is_print: printReceipt
    };

    try {
      setIsPrinting(true);
      
      const saleResponse = await axios.post(
        `${baseURL}/inventories/pointsofsale`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      if (saleResponse.headers["content-type"]?.includes("application/json")) {
        const json = await saleResponse.data.text();
        const parsed = JSON.parse(json);
        toast.success(parsed.message);
      }

      if (saleResponse.data) {
        const blob = new Blob([saleResponse.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        if (printReceipt) {
          const receiptTab = window.open(url, "_blank");
          if (receiptTab) {
            setTimeout(() => {
              receiptTab.close();
            }, 30000);
          }
        }
        
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      } else {
        setTimeout(() => {
          if (contentRef.current) {
            reactToPrintFn();
          }
        }, 50000);
      }

      setCart([]);
      setShowConfirmationModal(false);
      
    } catch (error: any) {
      console.error("Checkout failed:", error.response);
      toast.error(error?.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <SelectionModal
        show={showSelectionModal}
        warehouse={warehouse}
        warehouseError={warehouseError}
        onWarehouseChange={handleWarehouseChange}
        onConfirm={confirmSelections}
      />

      <Toaster />
      <Header
        businessName={businessName}
        warehouse={warehouse}
        user={user}
        onLogout={handleLogout}
      />

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} h-[calc(100vh-80px)]`}>
        
        {/* Products Section */}
        <div className={`${isMobile ? "w-full" : "w-3/5"} flex flex-col bg-white border-r border-gray-200`}>
          <div className="p-6 border-b border-gray-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                ref={searchRef}
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between mb-4 mt-8">
              <h2 className="text-lg font-semibold text-gray-800">Products</h2>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              setQuery={setQuery}
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
                    name={item.item.name}
                    quantity={item.quantity}
                    item={item}
                    price={Math.floor(+item.item.selling_price)}
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

      <ConfirmationModal
        show={showConfirmationModal}
        cart={cart}
        totalAmount={totalAmount}
        customer={customer}
        paymentMethod={paymentMethod}
        isPrinting={isPrinting}
        isMobile={isMobile}
        onClose={() => setShowConfirmationModal(false)}
        onProcessCheckout={processCheckout}
        setCustomer={setCustomer}
        setPaymentMethod={setPaymentMethod}
        setTransactionId={setTransactionId}
        setAmountPaid={setAmountPaid}
      />

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