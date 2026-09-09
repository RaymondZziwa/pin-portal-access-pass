import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingCart, Search, CreditCard, Package, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import { PrintableContent } from './PrintableContent';
import useItems from "@/hooks/useItems";
import { baseURL } from "@/lib/api";
import useWarehouses from "@/hooks/useWarehouses";
import useCurrencies from "@/hooks/useCurrencies";
import usePaymentMethods from "@/hooks/usePaymentMethods";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { toast, Toaster } from "sonner";
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

const AUTO_LOGOUT_TIME = 5 * 60 * 1000;

const PosPage = () => {
  const navigate = useNavigate();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [warehouseError, setWarehouseError] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isCreditSale, setIsCreditSale] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPrintable, setShowPrintable] = useState(false);

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
  const [clientId, setClientId] = useState<string | null>("");
  const [receiptContent, setReceiptContent] = useState<any>(null);
  const [receiptNumber, setReceiptNumber] = useState<string>("");
  const [saleDate, setSaleDate] = useState<Date>(new Date());

const handleSaleDateChange = (date: Date) => {
  setSaleDate(date);
};
  
  // Refs
  const searchRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // User data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const company = useSelector((state: RootState) => state.userAuth.user.organisation)
  const { data: warehouses } = useWarehouses();
  const { data: currencies } = useCurrencies();
  const { data: paymentMethods } = usePaymentMethods();
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  const [warehouse, setWarehouse] = useState(() => localStorage.getItem("selectedWarehouse") || "");
  const businessName = JSON.parse(localStorage.getItem('user') || '').user.organisation.organisation_name
  const currency = JSON.parse(localStorage.getItem('user') || '').user.organisation.base_currency.code;
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
      result = result.filter((item) => item.item.item_category_id === selectedCategory);
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

  const generateReceipt = (externalWindow?: Window | null) => {
    return new Promise<void>((resolve, reject) => {
      setShowPrintable(true);

      // Use setTimeout to ensure the component is rendered before accessing it
      setTimeout(() => {
        const printContent = receiptRef.current;
        if (!printContent) return reject(new Error('Receipt content not found'));

        // Use provided external window (opened synchronously) if available to avoid popup blocking
        const printWindow = externalWindow ?? window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
          toast.error('Popup blocked! Please allow popups for this site to view receipts.');
          setShowPrintable(false);
          return reject(new Error('Popup blocked'));
        }

        const content = printContent.innerHTML;

        // Write content into the print window
        try {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Receipt-${new Date().getTime()}</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    margin: 0;
                    background: white;
                    color: #333;
                  }
                  @page { size: 80mm auto; margin: 0; }
                  @media print { body { margin: 0; } }
                </style>
              </head>
              <body>
                <div>${content}</div>
              </body>
            </html>
          `);
          printWindow.document.close();

          // Auto-print the receipt as PDF when content loads
          printWindow.onload = () => {
            try {
              printWindow.print();
            } catch (e) {
              console.warn('Print failed:', e);
            }
            // Close the window after 2 minutes to allow users ample time to save/print
            setTimeout(() => {
              try {
                printWindow.close();
              } catch (e) {
                // ignore
              }
            }, 120000);
          };

          printWindow.focus();

          // Reset the printable state
          setShowPrintable(false);
          resolve();
        } catch (err) {
          setShowPrintable(false);
          reject(err);
        }
      }, 100);
    });
  };

  const handlePrintInNewTab = () => {
    // Open the print window synchronously to avoid popup blockers
    const preOpened = window.open('', '_blank', 'width=800,height=600');
    if (!preOpened) {
      toast.error('Popup blocked! Please allow popups for this site to view receipts.');
      return;
    }

    // Provide a placeholder while backend/DOM finishes
    preOpened.document.write('<html><body><p>Preparing receipt...</p></body></html>');
    preOpened.document.close();

    generateReceipt(preOpened).then(() => {
      // Clear state after receipt is generated
    setCart([]);
    setPaymentMethod("");
    setTransactionId("");
    setAmountPaid("");
    setClientId("");
    setIsCreditSale(false);
    setShowConfirmationModal(false);
      setIsPrinting(false);
    }).catch((error) => {
      console.error('Receipt generation failed:', error);
      // Still clear state on error to prevent stuck state
      setCart([]);
      setPaymentMethod("");
      setTransactionId("");
      setAmountPaid("");
      setClientId("");
      setReceiptNumber("");
      setIsCreditSale(false);
      setShowConfirmationModal(false);
      setIsPrinting(false);
    });
  };

const processCheckout = async (printReceipt: boolean) => {
  // Generate unique receipt number (shorter format)
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomStr = Math.random().toString(36).substr(2, 3).toUpperCase(); // 3 random chars
  const newReceiptNumber = `RCP-${timestamp}${randomStr}`;

  if (!paymentMethod && !isCreditSale) {
    toast.error('Please select a payment method');
    return;
  }

  console.log('total amount', totalAmount)
  const payload = {
    cashier_id: user.user?.id,
    cashier_name: `${user.user?.first_name || ''} ${user.user?.last_name || ''}`,
    customer_id: clientId,
    is_credit_sale: isCreditSale,
    transaction_reference: transactionId,
    customer_name: customer || "",
    warehouse_id: localStorage.getItem("selectedWarehouse"),
    items: cart.map(item => ({
      item_id: item.item.id.toString(),
      quantity: item.quantity,
      discount: item.discount,
      price: item.actual_selling_price,
    })),
    payment_method_id: paymentMethod || "",
    amount_paid: isCreditSale ? parseFloat(amountPaid || "0") : totalAmount,
    // sale_date: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    sale_date: saleDate,
    currency_id: localStorage.getItem("selectedCurrency"),
    amount: total,
    is_print: false,
    //is_print: printReceipt,
  };

  if (isCreditSale && !clientId) {
    toast.error("Please select a customer for credit sales.");
    return;
    
  }

    try {
      setIsPrinting(true);

      // If printing is requested, open the print window synchronously to avoid popup blockers
      let preOpenedWindow: Window | null = null;
      if (printReceipt) {
        preOpenedWindow = window.open('', '_blank', 'width=800,height=600');
        if (!preOpenedWindow) {
          toast.error('Popup blocked! Please allow popups for this site to view receipts.');
          // Continue without printing
          printReceipt = false;
        } else {
          preOpenedWindow.document.write('<html><body><p>Processing sale, preparing receipt...</p></body></html>');
          preOpenedWindow.document.close();
        }
      }

      // Send sale data to backend asynchronously
      axios.post(
        `${baseURL}/inventories/pointsofsale`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      ).then((saleResponse) => {
        if (saleResponse.headers["content-type"]?.includes("application/json")) {
          saleResponse.data.text().then(async (text) => {
            const parsed = JSON.parse(text);
            console.log("Backend sale processing response:", parsed.data.sale);
            setReceiptContent(parsed.data.sale);
            if (printReceipt) {
              // Set receipt number in state before generating receipt
              setReceiptNumber(parsed.data.sale.unique_id);
              try {
                await generateReceipt(preOpenedWindow);
              } catch (err) {
                console.error('Receipt generation failed after sale:', err);
                // close preOpenedWindow if still open
                try { preOpenedWindow?.close(); } catch (e) {}
              }
              setCart([]);
            } else {
              setCart([]);
            }
            toast.success(parsed.message);
          });
        }
      }).catch((error: any) => {
        console.log("Backend sale processing failed:", error.response);
        // Don't show error toast here as receipt was already generated
        // The sale might still be processed successfully even if backend response fails
      });

    // Show success message immediately after receipt generation
    //toast.success("Sale completed successfully!");

    // Clear cart and reset state after successful receipt generation
    setPaymentMethod("");
    setTransactionId("");
    setAmountPaid("");
    setClientId("");
    setReceiptNumber("");
    setIsCreditSale(false);
    setShowConfirmationModal(false);

  } catch (error: any) {
    console.log(error)
    console.log("Checkout failed:", error.response);
    toast.error(error?.response?.data?.message || "Checkout failed. Please try again.");
  } finally {
    setIsPrinting(false);
    setReceiptNumber("");
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
        saleDate={saleDate}
        onSaleDateChange={handleSaleDateChange}
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
                onChange={(e) => { 
                  setQuery(e.target.value)
                  setCurrentPage(1)
                }}
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
              setCurrentPage={setCurrentPage} 
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
                    currency={currency}
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
<div className={`${isMobile ? "w-full" : "w-2/5"} flex flex-col bg-gradient-to-b from-gray-50 to-white h-[calc(100vh-2rem)]`}>
  <div className="flex-1 flex flex-col min-h-0">
    <div className="p-6 border-b border-gray-100 bg-white flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
        <div className="bg-teal-100 text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
          {cart.length} items
        </div>
      </div>
      <p className="text-sm text-gray-600">Review your order before checkout</p>
    </div>

    <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
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

    <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0">
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl">
          <span className="font-semibold text-gray-700">Total Amount:</span>
          <span className="font-bold text-2xl text-teal-600">
            {currency} {totalAmount.toFixed(2)}
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
        total={totalAmount}
        setClientId={setClientId}
        setIsCreditSale={setIsCreditSale}
        isCreditSale={isCreditSale} 
      />

      {/* Conditionally Rendered Print Content */}
      { showPrintable && (
        <div style={{ display: "none" }}>
          <div ref={receiptRef}>
            <PrintableContent
              company={company}
              store={warehouses.find((w) => w.id === warehouse)?.name}
              customer={receiptContent.customer_name}
              sale={{
                cashier: `${user.user?.first_name || ''} ${user.user?.last_name || ''}`.trim() || user.user?.username || 'Admin',
                receipt_number: receiptNumber || undefined
              }}
              receiptNumber = {receiptNumber}
              items={cart}
              totals={{
                total: totalAmount,
                tax: 0,
                tax_rate: 0,
                discount: cart.reduce((sum, item) => sum + item.discount * item.quantity, 0)
              }}
              payment={{
                method: paymentMethods.find((pm) => pm.id.toString() === paymentMethod)?.name || "Cash",
                amount_paid: isCreditSale ? parseFloat(amountPaid || "0") : totalAmount,
                change: 0 // Calculate change if needed
              }}
              currency={currencies.find((c) => c.id.toString() === localStorage.getItem("selectedCurrency")) || user?.base_currency}
              amountPaid={isCreditSale ? parseFloat(amountPaid || "0") : totalAmount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PosPage;