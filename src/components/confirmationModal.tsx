import React, { useRef } from 'react';
import { PaymentComponent } from './paymentComponent';
import { useReactToPrint } from 'react-to-print';
import { PrintableContent } from './PrintableContent';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

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
  item: any;
}

interface ConfirmationModalProps {
  show: boolean;
  cart: CartItemType[];
  totalAmount: number;
  customer: string | number | null;
  paymentMethod: string | null;
  isPrinting: boolean;
  total: any;
  isMobile: boolean;
  onClose: () => void;
  onProcessCheckout: (printReceipt: boolean) => void;
  setCustomer: (name: string | number | null) => void;
  setClientId: (id: string) => void;
  setPaymentMethod: (method: string | null) => void;
  setTransactionId: (number: string | null) => void;
  setAmountPaid: (amount: string) => void;
  setIsCreditSale: (bool: boolean) => void;
  isCreditSale: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  cart,
  totalAmount,
  customer,
  paymentMethod,
  isPrinting,
  isMobile,
  onClose,
  onProcessCheckout,
  setCustomer,
  setPaymentMethod,
  setTransactionId,
  setAmountPaid,
  setClientId,
  total,
  isCreditSale,
  setIsCreditSale
}) => {
  console.log('total', total)
    const currency = JSON.parse(localStorage.getItem('user') || '').user.organisation.base_currency.code;
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Confirm Order</h2>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Cart Items Section - Scrollable */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Order Items</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Cart Total: </span>
                    <span className="text-2xl font-bold text-teal-600">
                      {currency} {totalAmount.toFixed(1)}
                    </span>
                  </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.item?.name || item.name}
                        </p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        {item.discount > 0 && (
                          <p className="text-xs text-green-600">Discount: {currency} {item.discount}</p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800">
                        {currency} {((item.quantity * item.actual_selling_price) - (item.discount * item.quantity)).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.unit_of_measure?.abbreviation && (
                        <span>Unit: {item.unit_of_measure.abbreviation}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <PaymentComponent
                setClientName={setCustomer}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                total={total}
                setClientId={setClientId}
                isMobile={isMobile}
                setTransactionId={setTransactionId}
                setAmountPaid={setAmountPaid}
                setIsCreditSale={setIsCreditSale}
                isCreditSale={isCreditSale}
              />

              {/* Total Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className={`flex ${isMobile ? "flex-col space-y-3" : "space-x-3"}`}>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onProcessCheckout(false)}
                  disabled={isPrinting}
                  className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-all disabled:opacity-50"
                >
                  {isPrinting ? 'Processing...' : 'Complete Order'}
                </button>
                {!isCreditSale && (
                  <button
                    onClick={() => onProcessCheckout(true)}
                    disabled={isPrinting}
                    className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all disabled:opacity-50"
                  >
                    {isPrinting ? 'Printing...' : 'Complete & Print'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};