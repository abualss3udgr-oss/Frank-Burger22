const fs = require('fs');
let content = fs.readFileSync('./src/views/AdminView.tsx', 'utf8');

const replacement = `          <nav className="space-y-1.5">

            {/* Overview - Super Admin Only */}
            {adminUser?.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('overview')}
                className={\`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer relative \${
                  activeTab === 'overview'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }\`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>الرئيسية والإحصائيات</span>
                </div>
                <ChevronLeft className={\`w-3.5 h-3.5 \${activeTab === 'overview' ? 'text-zinc-900' : 'text-zinc-500'}\`} />
              </button>
            )}

            {/* Orders Management - Super Admin Only */}
            {adminUser?.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('orders')}
                className={\`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer relative \${
                  activeTab === 'orders'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }\`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>إدارة الطلبات الحية</span>
                </div>
                <div className="flex items-center gap-2">
                  {pendingOrdersCount > 0 && (
                    <span className="bg-[#E51E2A] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm shadow-[#E51E2A]/20">
                      {pendingOrdersCount}
                    </span>
                  )}
                  <ChevronLeft className={\`w-3.5 h-3.5 \${activeTab === 'orders' ? 'text-zinc-900' : 'text-zinc-500'}\`} />
                </div>
              </button>
            )}

            {/* Shifts - Super Admin Only (View Reports) */}
            {adminUser?.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('shifts')}
                className={\`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer relative \${
                  activeTab === 'shifts'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }\`}
              >
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>تقارير الورديات</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeShift ? (
                    <span className={\`text-[10px] font-black px-2 py-0.5 rounded-full \${
                      activeTab === 'shifts' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
                    }\`}>
                      نشطة
                    </span>
                  ) : (
                    <span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded-md \${
                      activeTab === 'shifts' ? 'bg-white/20 text-zinc-900' : 'bg-zinc-200 text-zinc-600'
                    }\`}>
                      مغلقة
                    </span>
                  )}
                  <ChevronLeft className={\`w-3.5 h-3.5 \${activeTab === 'shifts' ? 'text-zinc-900' : 'text-zinc-500'}\`} />
                </div>
              </button>
            )}
`;

// Replace from `<nav className="space-y-1.5">` to just before `{/* Products - Super Admin Only */}`
const startToken = `<nav className="space-y-1.5">`;
const endToken = `{/* Products - Super Admin Only */}`;
const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + replacement + '\n            ' + content.slice(endIndex);
  fs.writeFileSync('./src/views/AdminView.tsx', content, 'utf8');
  console.log("Success");
} else {
  console.log("Failed to find tokens");
}
