
import React from 'react';

interface PrintableContentProps {
  cart: any[];
  total: number;
  paymentMethod: string | null;
  businessName: string;
  isMobile?: boolean;
  servedBy: string;
}

export class PrintableContent extends React.Component<PrintableContentProps> {
  render() {
    const { cart, total, paymentMethod, businessName, servedBy } = this.props;
    const today = new Date();
    const user = JSON.parse(localStorage.getItem('user'));

    const formattedDate = today.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const formattedTime = today.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div style={{
        color: '#333',
        padding: '20px',
        fontFamily: "'Courier New', monospace",
        maxWidth: '58mm',
        margin: '0 auto',
        backgroundColor: 'white'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '2px dashed #333'
        }}>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111',
            textTransform: 'uppercase'
          }}>{businessName}</h2>
          <p style={{
            margin: '0',
            fontSize: '12px',
            color: '#666',
            fontWeight: 'bold'
          }}>POINT OF SALE RECEIPT</p>
        </div>

        {/* Transaction Info */}
        <div style={{
          marginBottom: '15px',
          fontSize: '11px',
          lineHeight: '1.4'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Date:</span>
            <span style={{ fontWeight: 'bold' }}>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Time:</span>
            <span style={{ fontWeight: 'bold' }}>{formattedTime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Served by:</span>
            <span style={{ fontWeight: 'bold' }}>{user.user.first_name} {user.user.last_name}</span>
          </div>
        </div>

        {/* Separator */}
        <div style={{
          borderTop: '1px dashed #333',
          marginBottom: '10px'
        }}></div>

        {/* Items Table */}
        <div style={{
          marginBottom: '15px',
          fontSize: '10px'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            fontWeight: 'bold',
            borderBottom: '1px solid #333',
            paddingBottom: '4px',
            marginBottom: '8px'
          }}>
            <div style={{ flex: '2', textAlign: 'left' }}>ITEM</div>
            <div style={{ flex: '1', textAlign: 'right' }}>QTY</div>
            <div style={{ flex: '1', textAlign: 'right' }}>PRICE</div>
            <div style={{ flex: '1', textAlign: 'right' }}>TOTAL</div>
          </div>

          {/* Items */}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px 0', color: '#999', fontStyle: 'italic' }}>
              No items in cart
            </div>
          ) : (
            cart.map((item, index) => {
              const itemTotal = (item.quantity * item.actual_selling_price) - (item.discount * item.quantity);
              return (
                <div key={item.id || index} style={{ marginBottom: '8px' }}>
                  {/* Main item row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ 
                      flex: '2', 
                      textAlign: 'left',
                      wordWrap: 'break-word',
                      fontSize: '9px',
                      lineHeight: '1.3'
                    }}>
                      {item.name}
                    </div>
                    <div style={{ flex: '1', textAlign: 'right' }}>
                      {item.quantity}
                    </div>
                    <div style={{ flex: '1', textAlign: 'right' }}>
                      {item.actual_selling_price?.toLocaleString()}
                    </div>
                    <div style={{ flex: '1', textAlign: 'right', fontWeight: 'bold' }}>
                      {itemTotal.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Discount row if applicable */}
                  {item.discount > 0 && (
                    <div style={{ 
                      fontSize: '8px', 
                      color: '#E53935',
                      marginTop: '2px',
                      paddingLeft: '4px'
                    }}>
                      Discount: -{item.discount.toLocaleString()} x {item.quantity}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Separator */}
        <div style={{
          borderTop: '2px dashed #333',
          marginBottom: '10px'
        }}></div>

        {/* Totals */}
        <div style={{
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '14px',
            padding: '8px 0'
          }}>
            <span>TOTAL:</span>
            <span>UGX {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '9px',
          color: '#666',
          borderTop: '1px dashed #333',
          paddingTop: '10px',
          lineHeight: '1.4'
        }}>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Thank you for your purchase!</p>
          <p style={{ margin: '4px 0', fontStyle: 'italic' }}>Goods sold are not returnable</p>
          <p style={{ margin: '4px 0' }}>Visit us again soon!</p>
          <div style={{ marginTop: '10px', fontSize: '8px' }}>
            Receipt generated on {formattedDate} at {formattedTime}
          </div>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body { margin: 0; }
            * { 
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        `}</style>
      </div>
    );
  }
}
