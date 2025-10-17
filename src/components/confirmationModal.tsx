import React from 'react';
import { PaymentComponent } from './paymentComponent';

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
  isMobile: boolean;
  onClose: () => void;
  onProcessCheckout: (printReceipt: boolean) => void;
  setCustomer: (name: string | number | null) => void;
  setPaymentMethod: (method: string | null) => void;
  setTransactionId: (number: string | null) => void;
  setAmountPaid: (amount: string) => void
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
  setAmountPaid
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Confirm Order</h2>

          <PaymentComponent
            setClientName={setCustomer}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isMobile={isMobile}
            setTransactionId={setTransactionId}
            setAmountPaid={setAmountPaid}
          />

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.item?.name || item.name} x{item.quantity}</span>
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
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onProcessCheckout(false)}
              disabled={isPrinting}
              className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-800 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {isPrinting ? 'Processing...' : 'Complete Order'}
            </button>
            <button
              onClick={() => onProcessCheckout(true)}
              disabled={isPrinting}
              className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-800 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {isPrinting ? 'Printing...' : 'Complete & Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};