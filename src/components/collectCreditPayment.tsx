 import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import usePaymentMethods from "@/hooks/usePaymentMethods";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface AddPaymentModalProps {
  visible: boolean;
    onHide: () => void;
    id: string;
  onSuccess?: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
    visible,
    id,
  onHide,
  onSuccess,
}) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
    const { data: pms } = usePaymentMethods();
    const token = useSelector((state: RootState) => state.userAuth.token.access_token);

  const handleSubmit = async (id: string) => {
    if (!amountPaid || !paymentMethod) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      currency_id: localStorage.getItem("selectedCurrency"),
      amount_paid: Number(amountPaid),
      payment_method_id: paymentMethod,
      payment_date: new Date().toISOString().split("T")[0],
    };

    try {
      setLoading(true);
      await apiRequest(`/inventories/${id}/settlepartialpayments`, "POST", token, payload);
      toast.success("Payment recorded successfully");
      if (onSuccess) onSuccess();
      onHide();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3">
      {/* <Button
        label="Cancel"
        className="p-button-text"
        onClick={onHide}
        disabled={loading}
      /> */}
      <Button
        label={loading ? "Saving..." : "Save Payment"}
        icon="pi pi-check"
        onClick={() => handleSubmit(id)}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header="Add Payment"
      visible={visible}
      style={{ width: "30rem" }}
      modal
      className="p-fluid"
      footer={footer}
      onHide={onHide}
    >
      {/* Payment Method */}
      <div className="field mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">Select Payment Method</option>
          {pms?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Amount Paid */}
      <div className="field mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount Paid
        </label>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder="Enter amount paid"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
    </Dialog>
  );
};

export default AddPaymentModal;
