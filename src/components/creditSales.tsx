import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { baseURL } from '@/lib/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Currency, Printer, Eye } from "lucide-react";
import AddPaymentModal from './collectCreditPayment';
import { useNavigate } from 'react-router-dom';
import { PrintableContent } from './PrintableContent';
import { toast, Toaster } from "sonner";
import PreviewModal from './previewModal';

const CreditSales = () => {
    const navigate = useNavigate()
      const currency = JSON.parse(localStorage.getItem('user') || '').user.organisation.base_currency.code;
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [showPrintable, setShowPrintable] = useState(false);
    const [selectedSaleForPrint, setSelectedSaleForPrint] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedSaleForPreview, setSelectedSaleForPreview] = useState(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const bkpUser = JSON.parse(localStorage.getItem('user'));
    const user = useSelector(
        (state: RootState) => state.userAuth.user?.employee?.id ?? bkpUser?.user?.employee?.id
    );

    const handleCollectPayment = (saleId: string) => {
        setSelectedSaleId(saleId);
        setShowModal(true);
    };

    const handlePreview = (sale: any) => {
        setSelectedSaleForPreview(sale);
        setShowPreviewModal(true);
    };

    const generateDetailedReceipt = (sale: any) => {
        return new Promise<void>((resolve, reject) => {
            setSelectedSaleForPrint(sale);
            setShowPrintable(true);
            
            setTimeout(() => {
                const printContent = receiptRef.current;
                if (printContent) {
                    const printWindow = window.open('', '_blank', 'width=800,height=600');
                    if (printWindow) {
                        const content = printContent.innerHTML;
                        
                        printWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>Receipt-${sale.invoice_no}</title>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <style>
                                  body { 
                                    font-family: Arial, sans-serif; 
                                    margin: 0;
                                    background: white;
                                    color: #333;
                                  }
                                  @page {
                                    size: 80mm auto;
                                    margin: 0;
                                  }
                                  @media print {
                                    body { margin: 0; }
                                  }
                                </style>
                              </head>
                              <body>
                                <div>${content}</div>
                              </body>
                            </html>
                          `);
                        
                        printWindow.document.close();

                        printWindow.onload = () => {
                            printWindow.print();
                            setTimeout(() => {
                                printWindow.close();
                            }, 120000);
                        };

                        printWindow.focus();
                        
                        setShowPrintable(false);
                        setSelectedSaleForPrint(null);
                        resolve();
                    } else {
                        toast.error('Popup blocked! Please allow popups for this site to view receipts.');
                        setShowPrintable(false);
                        setSelectedSaleForPrint(null);
                        reject(new Error('Popup blocked'));
                    }
                } else {
                    setShowPrintable(false);
                    setSelectedSaleForPrint(null);
                    reject(new Error('Receipt content not found'));
                }
            }, 100);
        });
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            setLoading(true);
            if (!bkpUser.token.access_token) {
                throw new Error('No authentication token found');
            }

            const params = {
                start_date: filters.startDate || undefined,
                end_date: filters.endDate || undefined,
                cashier_id: user
            };

            const response = await axios.get(`${baseURL}/inventories/partialsales?warehouse_id=${localStorage.getItem('selectedWarehouse')}`, {
                headers: {
                    'Authorization': `Bearer ${bkpUser.token.access_token}`,
                    'Content-Type': 'application/json'
                },
                params: params
            });
            
            if (response.data.success) {
                setSales(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch sales data');
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            startDate: '',
            endDate: '',
            search: ''
        });
    };
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
            credit: { color: 'bg-yellow-100 text-yellow-800', label: 'Credit' },
            partial: { color: 'bg-blue-100 text-blue-800', label: 'Partial' }
        };
        
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredSales = sales.filter(sale => {
        const matchesStatus = filters.status === 'all' || sale.status === filters.status;
        const matchesSearch = sale.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
                            sale.invoice_no.toLowerCase().includes(filters.search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const summary = {
        totalSales: filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0),
        totalPaid: filteredSales.reduce((sum, sale) => sum + parseFloat(sale.paid), 0),
        totalBalance: filteredSales.reduce((sum, sale) => sum + parseFloat(sale.balance), 0),
        paidCount: filteredSales.filter(sale => sale.status === 'paid').length,
        creditCount: filteredSales.filter(sale => sale.status === 'credit').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-lg shadow">
                            <div className="h-12 bg-gray-200 rounded-t-lg"></div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 border-b border-gray-200 p-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className='flex flex-row justify-between'>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Credit Overview</h1>
                        <p className="text-gray-600 mt-2">Manage and track your credit transactions</p>
                    </div>
                    <button
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out active:scale-95 h-[50px]"
                        onClick={()=> navigate('/pos')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Go Back
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(summary.totalSales)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{filteredSales.length} transactions</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(summary.totalPaid)}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{summary.paidCount} paid transactions</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(summary.totalBalance)}
                                </p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{summary.creditCount} pending transactions</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search customers or invoices..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="credit">Credit</option>
                                <option value="partial">Partial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Clear Filters
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchSalesData}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer & Invoice
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paid Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSales.map((sale) => (
                                    <tr key={sale.invoice_no} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDate(sale.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {sale.customer}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {sale.invoice_no}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(sale.total)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-green-600">
                                                {formatCurrency(sale.paid)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${parseFloat(sale.balance) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {formatCurrency(sale.balance)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(sale.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button 
                                                    className="flex items-center gap-2 px-3 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                                                    onClick={() => handlePreview(sale)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm">Preview</span>
                                                </button>
                                                {sale.paid > 0 && (
                                                    <button 
                                                        className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                        onClick={() => generateDetailedReceipt(sale)}
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                        <span className="text-sm">Print</span>
                                                    </button>
                                                )}
                                                <button 
                                                    className="flex items-center gap-2 px-3 py-2 rounded bg-teal-100 hover:bg-teal-200 text-teal-700" 
                                                    onClick={() => handleCollectPayment(sale.sale_id)}
                                                >
                                                    <Currency className="w-4 h-4" />
                                                    <span className="text-sm">Collect</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSales.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No credit sales found</h3>
                            <p className="mt-1 text-sm text-gray-500">No sales records match your current filters.</p>
                            <div className="mt-6">
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Clear filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <AddPaymentModal
                visible={showModal}
                onHide={() => setShowModal(false)}
                id={selectedSaleId}
                onSuccess={fetchSalesData}
            />

            <PreviewModal
                show={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                sale={selectedSaleForPreview}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />

            {/* Conditionally Rendered Print Content */}
            {showPrintable && selectedSaleForPrint && (
                <div style={{ display: "none" }}>
                    <div ref={receiptRef}>
                        <PrintableContent
                            company={JSON.parse(localStorage.getItem('user') || '{}').user?.organisation || {}}
                            store={selectedSaleForPrint.warehouse?.name}
                            customer={{ name: selectedSaleForPrint.customer }}
                            sale={{
                                cashier: `${JSON.parse(localStorage.getItem('user') || '{}').user?.first_name || ''} ${JSON.parse(localStorage.getItem('user') || '{}').user?.last_name || ''}`.trim() || JSON.parse(localStorage.getItem('user') || '{}').user?.username || 'Admin',
                                receipt_number: selectedSaleForPrint.invoice_no,
                                date: selectedSaleForPrint.date
                            }}
                            items={selectedSaleForPrint.items.map(item => ({
                                item: { name: item.item_name },
                                quantity: item.quantity,
                                actual_selling_price: parseFloat(item.unit_price || 0),
                                discount: 0
                            }))}
                            totals={{
                                total: parseFloat(selectedSaleForPrint.total),
                                tax: 0,
                                tax_rate: 0,
                                discount: 0
                            }}
                            payment={{
                                method: selectedSaleForPrint.payment_method?.name || "Cash",
                                amount_paid: selectedSaleForPrint.paid,
                                change: 0
                            }}
                            currency={JSON.parse(localStorage.getItem('user') || '{}')?.base_currency}
                            amountPaid={selectedSaleForPrint.paid}
                        />
                    </div>
                </div>
            )}
            <Toaster />
        </div>
    );
};

export default CreditSales;