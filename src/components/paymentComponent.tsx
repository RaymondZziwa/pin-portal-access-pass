import React from 'react';
import usePaymentMethods from "@/hooks/usePaymentMethods";

interface PaymentComponentProps {
  setClientName: (name: string | number | null) => void;
  setTransactionId: (number: string) => void;
  paymentMethod: string | null;
  setPaymentMethod: (method: string | null) => void;
  setAmountPaid: (amount: string) => void
  isMobile?: boolean;
}

export const PaymentComponent: React.FC<PaymentComponentProps> = ({ 
  setClientName, 
  paymentMethod, 
  setPaymentMethod,
  setTransactionId,
  setAmountPaid,
  isMobile = false 
}) => {
  const { data: pms } = usePaymentMethods();

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
          value={paymentMethod || ''}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="" disabled>Select Payment Method</option>
          {pms.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
        <input
          type="text"
          onChange={(e) => setAmountPaid(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter amount paid"
        />
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Id (Optional)</label>
        <input
          type="text"
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter transactionId"
        />
      </div>
    </div>
  );
};