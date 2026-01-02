import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import usePaymentMethods from "@/hooks/usePaymentMethods";
import useCustomer from '@/hooks/useCustomers';

interface PaymentComponentProps {
  setClientName: (name: string | number | null) => void;
  setTransactionId: (number: string) => void;
  setClientId: (id: string | null) => void;
  paymentMethod: string | null;
  setPaymentMethod: (method: string | null) => void;
  setAmountPaid: (amount: string) => void;
  setIsCreditSale: (bool: boolean) => void;
  isCreditSale: boolean;
  isMobile?: boolean;
  total: number;
}

export const PaymentComponent: React.FC<PaymentComponentProps> = ({
  setClientName,
  paymentMethod,
  setPaymentMethod,
  setTransactionId,
  setAmountPaid,
  setIsCreditSale,
  isCreditSale,
  total,
  setClientId,
  isMobile = false,
}) => {
  const { data: pms = [] } = usePaymentMethods();
  const { data: customers = [] } = useCustomer();

  const [selectedPm, setSelectedPm] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [isPartialPayment, setIsPartialPayment] = useState<boolean>(false);

  // Keep selected payment method details
  useEffect(() => {
    if (paymentMethod) {
      const foundPaymentMethod = pms.find((p) => p.id === paymentMethod);
      setSelectedPm(foundPaymentMethod);
    } else {
      setSelectedPm(null);
    }
  }, [paymentMethod, pms]);

  // Prepare react-select options
  const customerOptions = customers.map((c: any) => ({
    value: c.id,
    label: `${c.organization_name ? `${c.organization_name} - ` : ''} ${c.first_name ?? ''} ${c.last_name ?? ''} - ${c.phone} - Credit: (UGX ${c.outstanding_sale_balance})`.trim(),
  }));

  // Handle select change for registered customer
  const handleCustomerChange = (selected: any) => {
    if (selected) {
      const found = customers.find((c: any) => c.id === selected.value);
      if (found) setClientId(found.id);
    } else {
      setClientId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Customer Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="customerType"
              checked={isRegistered}
              onChange={() => setIsRegistered(true)}
              className="text-teal-600 focus:ring-teal-500"
            />
            <span>Registered</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="customerType"
              checked={!isRegistered}
              onChange={() => {
                setIsRegistered(false);
                setClientName('');
                setClientId(null);
              }}
              className="text-teal-600 focus:ring-teal-500"
            />
            <span>Not Registered</span>
          </label>
        </div>
      </div>

      {/* Select or Enter Customer */}
      {isRegistered ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
          <Select
            options={customerOptions}
            isClearable
            placeholder="Search customer by name..."
            onChange={handleCustomerChange}
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#E5E7EB',
                borderRadius: '0.5rem',
                minHeight: '2.5rem',
              }),
            }}
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setClientName(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter customer name"
          />
        </div>
      )}

      {/* Credit Sale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Is Credit Sale?</label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="creditSale"
              checked={isCreditSale}
              onChange={() => {
                setIsCreditSale(true);
                setPaymentMethod(null);
                setAmountPaid('');
              }}
              className="text-teal-600 focus:ring-teal-500"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="creditSale"
              checked={!isCreditSale}
              onChange={() => {
                setIsCreditSale(false);
                setIsPartialPayment(false);
                setAmountPaid(total.toString());
              }}
              className="text-teal-600 focus:ring-teal-500"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {/* Payment Section */}
      {isCreditSale ? (
        <>
          {/* Ask for Partial Payment */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="partialPayment"
              checked={isPartialPayment}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsPartialPayment(checked);
                if (!checked) {
                  setPaymentMethod(null);
                  setAmountPaid('');
                }
              }}
              className="text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="partialPayment" className="text-sm text-gray-700">
              Partial Payment
            </label>
          </div>

          {isPartialPayment && (
            <>
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod || ''}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="" disabled>Select Payment Method</option>
                  {pms.map((pm: any) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
                <input
                  type="number"
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter amount paid"
                />
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* Non-credit sale (full payment) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod || ''}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="" disabled>Select Payment Method</option>
              {pms.map((pm: any) => (
                <option key={pm.id} value={pm.id}>{pm.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
            <input
              type="number"
              value={total}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:ring-0 focus:border-gray-200"
            />
          </div>
        </>
      )}

      {/* Transaction ID - only if selected payment method requires it */}
      {selectedPm?.require_transaction_ref === 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction ID (Optional)
          </label>
          <input
            type="text"
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter transaction ID"
          />
        </div>
      )}
    </div>
  );
};
