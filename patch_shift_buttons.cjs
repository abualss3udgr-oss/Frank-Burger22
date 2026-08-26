const fs = require('fs');
let content = fs.readFileSync('src/components/ShiftManagementView.tsx', 'utf8');

content = content.replace(
  /<button\s+onClick=\{\(\) => setIsExpenseModalOpen\(true\)\}\s+className="px-3\.5 py-2\.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1\.5 transition-colors cursor-pointer"\s+>\s+<TrendingDown className="w-4 h-4" \/>\s+<span>سحب مبلغ \/ مصروف<\/span>\s+<\/button>\s+<button\s+onClick=\{handleStartCloseShift\}\s+className="px-3\.5 py-2\.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1\.5 transition-colors cursor-pointer"\s+>\s+<Lock className="w-4 h-4" \/>\s+<span>تقفيل الوردية للتسليم<\/span>\s+<\/button>/g,
  `{!isSuperAdmin && (
                  <>
                    <button
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>سحب مبلغ / مصروف</span>
                    </button>
                    <button
                      onClick={handleStartCloseShift}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>تقفيل الوردية للتسليم</span>
                    </button>
                  </>
                )}`
);

content = content.replace(
  /<button\s+onClick=\{handleStartOpenShift\}\s+className="px-6 py-3 rounded-2xl bg-\[#E51E2A\] hover:bg-\[#c01823\] text-white text-xs font-black inline-flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-\[#E51E2A\]\/20"\s+>\s+<Plus className="w-4 h-4" \/>\s+<span>فتح وردية جديدة الآن<\/span>\s+<\/button>/g,
  `{!isSuperAdmin && (
            <button
              onClick={handleStartOpenShift}
              className="px-6 py-3 rounded-2xl bg-[#E51E2A] hover:bg-[#c01823] text-white text-xs font-black inline-flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-[#E51E2A]/20"
            >
              <Plus className="w-4 h-4" />
              <span>فتح وردية جديدة الآن</span>
            </button>
          )}`
);

fs.writeFileSync('src/components/ShiftManagementView.tsx', content, 'utf8');
