import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '@/lib/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Printer } from "lucide-react";

const RecentSales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });
    const user = useSelector((state: RootState) => state.userAuth.user.employee.id)
    const token = useSelector((state: RootState) => state.userAuth.token.access_token);

    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            setLoading(true);
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const params = {
                start_date: filters.startDate || undefined,
                end_date: filters.endDate || undefined,
                cashier_id: user
            };

            const response = await axios.get(`${baseURL}/inventories/pos/allsales`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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

    const handleReceiptPrint = async (id: string) => {
  try {
    const saleResponse = await axios.get(
      `${baseURL}/inventories/pos/${id}/receipt`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    if (saleResponse.data) {
      const blob = new Blob([saleResponse.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const receiptTab = window.open(url, "_blank");
      if (receiptTab) {
        setTimeout(() => {
          receiptTab.close();
        }, 30000);
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    }
  } catch (error) {
    console.error("Failed to print receipt:", error);
    // Optional: show a toast or alert to the user
    // toast.error("Failed to print receipt. Please try again.");
  }
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
            currency: 'UGX'
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Sales Overview</h1>
                    <p className="text-gray-600 mt-2">Manage and track your sales transactions</p>
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
                        {/* Search */}
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

                        {/* Status Filter */}
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

                        {/* Start Date */}
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

                        {/* End Date */}
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
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export
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
                                            {getStatusBadge(sale.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={() => handleReceiptPrint(sale.sale_id)}>
                                                <Printer className="w-5 h-5" />
                                                Print Receipt
                                            </button>
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
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
        </div>
    );
};

export default RecentSales;