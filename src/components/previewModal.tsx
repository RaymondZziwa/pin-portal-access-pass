import React from 'react';
import { X, User, Calendar, Hash, CreditCard, DollarSign, Package, Receipt, Building2, Wallet } from 'lucide-react';

interface PreviewModalProps {
    show: boolean;
    onClose: () => void;
    sale: any;
    formatCurrency: (amount: any) => string;
    formatDate: (dateString: string) => string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ show, onClose, sale, formatCurrency, formatDate }) => {
    if (!show || !sale) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'credit':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'partial':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Fully Paid';
            case 'credit':
                return 'Credit';
            case 'partial':
                return 'Partially Paid';
            default:
                return status;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-6 h-6 text-teal-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Sale Details</h2>
                            <p className="text-sm text-gray-500">Complete transaction information</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Status Badge */}
                    <div className="mb-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(sale.status)}`}>
                            {getStatusLabel(sale.status)}
                        </span>
                    </div>

                    {/* Sale Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Customer Name</p>
                                    <p className="text-lg font-semibold text-gray-800">{sale.customer}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Hash className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Invoice Number</p>
                                    <p className="text-lg font-semibold text-gray-800">{sale.invoice_no}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Sale Date</p>
                                    <p className="text-lg font-semibold text-gray-800">{formatDate(sale.date)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Warehouse</p>
                                    <p className="text-lg font-semibold text-gray-800">{sale.warehouse?.name || 'N/A'}</p>
                                    {sale.warehouse?.location && (
                                        <p className="text-sm text-gray-500">{sale.warehouse.location}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="text-lg font-semibold text-gray-800">{sale.payment_method?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            UOM
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit Price
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sale.items?.map((item: any, index: number) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.item_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.uom?.abbreviation || item.uom?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right font-semibold text-gray-800">
                                            Total:
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-teal-600">
                                            {formatCurrency(sale.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                <p className="text-sm text-green-600 mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-green-700">{formatCurrency(sale.total)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                <p className="text-sm text-blue-600 mb-1">Amount Paid</p>
                                <p className="text-2xl font-bold text-blue-700">{formatCurrency(sale.paid)}</p>
                                <p className="text-xs text-blue-500 mt-1">
                                    {sale.payments?.length || 0} payment(s)
                                </p>
                            </div>
                            <div className={`bg-gradient-to-br rounded-xl p-4 border ${
                                parseFloat(sale.balance) > 0 
                                    ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                                    : 'from-gray-50 to-gray-100 border-gray-200'
                            }`}>
                                <p className={`text-sm mb-1 ${
                                    parseFloat(sale.balance) > 0 ? 'text-yellow-600' : 'text-gray-600'
                                }`}>
                                    Outstanding Balance
                                </p>
                                <p className={`text-2xl font-bold ${
                                    parseFloat(sale.balance) > 0 ? 'text-yellow-700' : 'text-gray-700'
                                }`}>
                                    {formatCurrency(sale.balance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    {sale.payments && sale.payments.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
                            </div>
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reference
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sale.payments.map((payment: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(payment.payment_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {payment.transaction_reference}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;