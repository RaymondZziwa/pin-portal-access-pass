 import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import usePaymentMethods from "@/hooks/usePaymentMethods";
import { apiRequest, baseURL } from "@/lib/api";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";

interface AddPaymentModalProps {
  visible: boolean;
    onHide: () => void;
    id: string;
  onSuccess: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
    visible,
    id,
  onHide,
  onSuccess,
}) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>("");
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
      transactionId: transactionId,
      payment_date: new Date().toISOString().split("T")[0],
      is_print: true
    };

    try {
      setLoading(true);
      const saleResponse = await axios.post(
        `${baseURL}/inventories/${id}/settlepartialpayments`,
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

        if (parseInt(amountPaid) !=0) {
          const receiptTab = window.open(url, "_blank");
          if (receiptTab) {
            setTimeout(() => {
              receiptTab.close();
            }, 300000);
          }
        }
        
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      } 
      
      onSuccess()
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Id (Optional)</label>
        <input
          type="text"
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter transaction ID"
        />
      </div>
    </Dialog>
  );
};

export default AddPaymentModal;
