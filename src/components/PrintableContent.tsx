import React from "react";

interface PrintableContentProps {
  company: any;
  store: any;
  customer: any;
  sale?: any;
  items: any[];
  totals: any;
  payment: any;
  currency?: any;
  configs?: any;
  amountPaid?: any;
}

export class PrintableContent extends React.Component<PrintableContentProps> {
  render() {
    const { company, store, customer, sale, items, totals, amountPaid, payment, currency, configs } = this.props;
    console.log("Printable items:", company, store, customer, sale, items, currency);

    const formattedDate = new Date().toLocaleString();

    return (
      <div style={{ width: "80mm", background: "#fff", padding: 0, margin: 0 }}>
        <style>{`
            * { margin: 0; padding: 0; }
            @page { size: 80mm; margin: 0; }
            body {
                font-family: DejaVu Sans, sans-serif;
                font-size: 11px;
                line-height: 1.3;
                width: 80mm;
                background: #fff;
            }
            .receipt-container { width: 95%; max-width: 80mm; margin: auto; text-align: center; padding: 3px; }
            .header { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 8px; }
            .company-name { font-weight: bold; font-size: 13px; text-transform: uppercase; }
            .company-address, .company-contact { font-size: 9px; margin: 2px 0; }
            .receipt-title { font-weight: bold; font-size: 12px; margin-top: 5px; }
            .receipt-info { width: 100%; margin: 2px 0; font-size: 10px; }
            .receipt-info td { width: 50%; padding: 2px 0; }
            .customer-info { font-size: 10px; border-bottom: 1px dashed #999; padding-bottom: 3px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10px; }
            .items-table th { border-bottom: 1px solid #000; text-align: left; padding: 3px; }
            .items-table td { border-bottom: 1px dashed #ccc; padding: 3px 2px; }
            .item-price, .item_amount { text-align: right; }
            .totals-section { border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
            .grand-total { font-weight: bold; font-size: 12px; border-top: 2px double #000; padding-top: 4px; }
            .payment-info { border: 1px dashed #000; margin-top: 5px; padding: 5px; }
            .thank-you { font-weight: bold; font-size: 11px; margin: 6px 0; }
            .footer { border-top: 1px dashed #000; padding-top: 5px; font-size: 9px; margin-top: 8px; }
        `}</style>

        <div className="receipt-container">
          
          {/* Header */}
          <div className="header">
            <div className="company-name">{company?.organisation_name || "YOUR COMPANY NAME"}</div>
            <div className="company-address">{company?.address}</div>

            <div className="company-contact">
              {company?.phone && (
                <>
                  Tel: {company.phone}
                  {company?.secondary_phone ? ` / ${company.secondary_phone}` : ""}
                </>
              )}
              {company?.email && <> | Email: {company.email}</>}
            </div>

            <div className="receipt-title">SALES RECEIPT</div>
            <div>Receipt #: <strong>{sale?.receipt_number || "RCP-001"}</strong></div>
          </div>

          {/* Receipt info */}
          <table className="receipt-info">
            <tbody>
              <tr>
                <td>Store: <strong>{store || "Admin"}</strong></td>
                <td style={{ textAlign: "right" }}>Date: {sale?.date || formattedDate}</td>
              </tr>

              <tr>
                <td>
                  {customer?.name && <>Customer: <strong>{customer.name}</strong></>}
                </td>
                <td style={{ textAlign: "right" }}>Cashier: {sale?.cashier || "Admin"}</td>
              </tr>
            </tbody>
          </table>

          {/* Items */}
          <table className="items-table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>QTY</th>
                <th>UOM</th>
                <th className="item-price">AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.item.name}
                    <div style={{ fontSize: "9px", color: "#666", fontWeight: "700" }}>
                      @ {Number(item.actual_selling_price).toFixed(2)}
                      {item.discount ? <> | Disc: {Number(item.discount).toFixed(1)}</> : 0}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "center" }}>
                    {item.item.unit_of_measure ? item.item.unit_of_measure.name.toUpperCase() : "-"}
                  </td>
                  <td className="item_amount">
                    {Number(item.actual_selling_price).toFixed(1) * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <table className="totals-section" style={{ width: "100%" }}>
            <tbody>
              

              {totals.tax > 0 && (
                <tr>
                  <td>Tax ({totals.tax_rate}%):</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>
                    {Number(totals.tax).toFixed(2)}
                  </td>
                </tr>
              )}

              {totals.discount > 0 && (
                <tr>
                  <td>Discount:</td>
                  <td style={{ textAlign: "right" }}>
                    -{Number(totals.discount).toFixed(2)}
                  </td>
                </tr>
              )}

              <tr className="grand-total">
                <td>
                  TOTAL ({currency?.code || "UGX"}):
                </td>
                <td style={{ textAlign: "right" }}>
                  {Number(totals.total).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Payment info */}
          <div className="payment-info">
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td>Payment Method:</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>
                    {payment?.method || "Cash"}
                  </td>
                </tr>

                <tr>
                  <td>Amount Paid:</td>
                  <td style={{ textAlign: "right" }}>
                    {Number(amountPaid || totals.total).toFixed(2)}
                  </td>
                </tr>

                {/* Change */}
                {payment?.change > 0 && (
                  <tr>
                    <td>Change:</td>
                    <td style={{ textAlign: "right" }}>
                      {Number(payment.change).toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Balance due */}
                {totals.total > (payment?.amount_paid || 0) && (
                  <tr>
                    <td><strong>Balance Due:</strong></td>
                    <td style={{ textAlign: "right", fontWeight: "bold", color: "red" }}>
                      {(totals.total - payment.amount_paid).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Thank you */}
          <div className="thank-you">
            {configs?.thankyou_message || "Thank you!"}
          </div>

          {/* Footer */}
          <div className="footer">
            {/* <div>{configs?.receipt_disclaimer}</div> */}
            <div>Call: {company?.phone}</div>
            {totals.tax > 0 && <div>VAT Included: {Number(totals.tax).toFixed(2)}</div>}
            <div style={{ marginTop: 4 }}>Printed: {formattedDate}</div>
          </div>
        </div>
      </div>
    );
  }
}
