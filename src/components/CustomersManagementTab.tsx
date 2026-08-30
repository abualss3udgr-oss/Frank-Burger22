import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RegisteredCustomer, Order } from '../types';
import {
  Search,
  Trash2,
  Mail,
  Smartphone,
  Calendar,
  Download,
  ShoppingBag,
  Heart,
  Users,
  Copy,
  ExternalLink,
} from 'lucide-react';

export function CustomersManagementTab() {
  const {
    registeredCustomers,
    deleteRegisteredCustomer,
    orders,
    language,
    addToast,
  } = useApp();

  const isAr = language === 'ar';

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Delete confirmation state
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return registeredCustomers.filter((cust) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.phone.includes(q) ||
        cust.email.toLowerCase().includes(q);

      let matchesDate = true;
      if (startDate || endDate) {
        const createdDate = new Date(cust.createdAt);
        createdDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (createdDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          if (createdDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [registeredCustomers, searchQuery, startDate, endDate]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      addToast(isAr ? 'لا توجد بيانات لتصديرها' : 'No data to export', 'error');
      return;
    }

    const headers = isAr
      ? ['الاسم الكامل', 'رقم الهاتف', 'البريد الإلكتروني', 'تاريخ التسجيل', 'عدد الطلبات', 'عدد المفضلة']
      : ['Full Name', 'Phone', 'Email', 'Registration Date', 'Orders Count', 'Favorites Count'];

    const rows = filteredCustomers.map((cust) => {
      // Calculate orders count
      const custOrdersCount = orders.filter(
        (o) =>
          (o.customer.phone && o.customer.phone === cust.phone) ||
          (o.customer.email && o.customer.email === cust.email)
      ).length;

      const favCount = cust.favorites ? cust.favorites.length : 0;
      const regDate = new Date(cust.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US');

      return [
        cust.name,
        cust.phone,
        cust.email,
        regDate,
        custOrdersCount,
        favCount,
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // BOM for UTF-8 (Arabic Excel support)
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registered_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(isAr ? 'تم تصدير ملف زبائن CSV بنجاح' : 'CSV exported successfully', 'success');
  };

  const copyToClipboard = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard.writeText(text);
    addToast(
      isAr
        ? `تم نسخ ${type === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'} بنجاح`
        : `Copied ${type === 'phone' ? 'phone number' : 'email'} successfully`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 font-heading tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E51E2A]" />
            <span>{isAr ? 'حسابات العملاء والزبائن المسجلين' : 'Registered Customers'}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {isAr
              ? 'إدارة ومتابعة زبائن الموقع الإلكتروني الذين قاموا بإنشاء حسابات للشراء.'
              : 'Monitor and manage website customers who registered accounts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isAr ? 'تصدير زبائن CSV' : 'Export Customers CSV'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث باسم الزبون، الهاتف، البريد...' : 'Search by name, phone, email...'}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:border-[#E51E2A] outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
          </div>

          {/* Date Filter & Clear Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] text-zinc-500 font-bold">{isAr ? 'من تاريخ التسجيل:' : 'From:'}</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-xs text-zinc-800 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] text-zinc-500 font-bold">{isAr ? 'إلى تاريخ:' : 'To:'}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-xs text-zinc-800 focus:outline-none cursor-pointer"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#E51E2A] rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                {isAr ? 'مسح التصفية' : 'Clear Filter'}
              </button>
            )}
          </div>
        </div>

        {/* Counter Statement */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-500 font-medium">
          <div>
            {isAr
              ? `يظهر ${filteredCustomers.length} من أصل ${registeredCustomers.length} زبون مسجل`
              : `Showing ${filteredCustomers.length} of ${registeredCustomers.length} registered customers`}
          </div>
        </div>
      </div>

      {/* Grid List of Customers */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-sm">
          <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-600">
            {isAr ? 'لا يوجد عملاء مسجلين يطابقون خيارات البحث' : 'No registered customers found matching search'}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {isAr ? 'جرب البحث بكلمات أخرى أو مسح فلاتر تاريخ التسجيل.' : 'Try different search keywords or clear date filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            // Count total orders made by this specific customer
            const customerOrders = orders.filter(
              (o) =>
                (o.customer.phone && o.customer.phone === cust.phone) ||
                (o.customer.email && o.customer.email === cust.email)
            );
            const ordersCount = customerOrders.length;
            const favCount = cust.favorites ? cust.favorites.length : 0;

            const initials = cust.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={cust.id}
                className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Section */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Initials Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center font-black text-rose-600 text-xs shrink-0 shadow-inner">
                        {initials || 'CU'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                          {cust.name}
                        </h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                          ID: {cust.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    {/* Delete Customer Button */}
                    <button
                      onClick={() => setConfirmingDeleteId(cust.id)}
                      title={isAr ? 'حذف حساب العميل' : 'Delete Customer Account'}
                      className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contact Info Detail Grid */}
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2.5">
                    {/* Phone */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-600 border-b border-zinc-200/30 pb-1.5">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{isAr ? 'الهاتف:' : 'Phone:'}</span>
                      </span>
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="font-mono text-zinc-900 font-semibold">{cust.phone}</span>
                        <button
                          onClick={() => copyToClipboard(cust.phone, 'phone')}
                          title={isAr ? 'نسخ الرقم' : 'Copy Phone'}
                          className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded transition-all"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-600 border-b border-zinc-200/30 pb-1.5">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{isAr ? 'البريد الإلكتروني:' : 'Email:'}</span>
                      </span>
                      <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                        <span className="font-mono text-zinc-900 font-medium break-all max-w-[130px] truncate sm:max-w-none">
                          {cust.email}
                        </span>
                        <button
                          onClick={() => copyToClipboard(cust.email, 'email')}
                          title={isAr ? 'نسخ البريد' : 'Copy Email'}
                          className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded transition-all shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Created At */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-600">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{isAr ? 'تاريخ التسجيل:' : 'Registration Date:'}</span>
                      </span>
                      <span className="font-bold text-zinc-800 text-start sm:text-end">
                        {new Date(cust.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Analytic Counters */}
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#E51E2A]" />
                        <span className="text-[10px] text-zinc-500 font-bold">{isAr ? 'إجمالي الطلبات' : 'Total Orders'}</span>
                      </div>
                      <span className="text-xs font-black text-zinc-950 font-mono bg-white border border-rose-100 px-2 py-0.5 rounded-md">
                        {ordersCount}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#E51E2A]" />
                        <span className="text-[10px] text-zinc-500 font-bold">{isAr ? 'المفضلة' : 'Favorites'}</span>
                      </div>
                      <span className="text-xs font-black text-zinc-950 font-mono bg-white border border-rose-100 px-2 py-0.5 rounded-md">
                        {favCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Delete Popup */}
                {confirmingDeleteId === cust.id && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
                    <p className="font-bold text-red-800 mb-2">
                      {isAr
                        ? 'هل أنت متأكد من حذف حساب هذا الزبون بالكامل؟'
                        : 'Are you sure you want to delete this customer account?'}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setConfirmingDeleteId(null)}
                        className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-700 font-bold hover:bg-zinc-50"
                      >
                        {isAr ? 'تراجع' : 'Cancel'}
                      </button>
                      <button
                        onClick={async () => {
                          await deleteRegisteredCustomer(cust.id);
                          setConfirmingDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                      >
                        {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
