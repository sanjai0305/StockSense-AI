import React from 'react';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  TrendingUp,
  Truck,
  BarChart2,
  Settings,
  Search,
  Bell,
  AlertCircle,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const salesPreviewData = [
  { date: 'Sep 10', sales: 8000 },
  { date: 'Sep 17', sales: 15000 },
  { date: 'Sep 24', sales: 11000 },
  { date: 'Oct 01', sales: 22000 },
  { date: 'Oct 08', sales: 28450 },
];

const stockDonutData = [
  { name: 'In Stock', value: 1020, color: '#10B981' },
  { name: 'Low Stock', value: 18, color: '#F59E0B' },
  { name: 'Out of Stock', value: 10, color: '#EF4444' },
];

const InventoryDashboardPreview = () => {
  return (
    <div className="w-full bg-[#032A1C]/90 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-2.5 sm:p-3.5 shadow-2xl shadow-emerald-950/80 overflow-hidden transform hover:scale-[1.005] transition-all duration-300">
      <div className="bg-white rounded-xl shadow-md border border-slate-200/80 overflow-hidden flex flex-col md:flex-row text-slate-800">
        {/* Mini Sidebar */}
        <div className="w-36 bg-[#032A1C] text-slate-300 p-2.5 flex-col justify-between hidden md:flex flex-shrink-0 border-r border-emerald-900/50">
          <div className="space-y-3">
            {/* Sidebar Brand */}
            <div className="flex items-center gap-1.5 px-1 py-0.5">
              <div className="w-6 h-6 rounded-lg bg-[#00966B] flex items-center justify-center text-white shadow-xs">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-white text-[11px] tracking-tight">
                StockSense AI
              </span>
            </div>

            {/* Sidebar Links */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#00966B] text-white font-bold shadow-xs">
                <LayoutDashboard className="w-3 h-3" />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-400 font-medium hover:text-white">
                <Package className="w-3 h-3" />
                <span>Inventory</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-400 font-medium hover:text-white">
                <ArrowDownLeft className="w-3 h-3" />
                <span>Purchase Orders</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-400 font-medium hover:text-white">
                <TrendingUp className="w-3 h-3" />
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-400 font-medium hover:text-white">
                <Truck className="w-3 h-3" />
                <span>Suppliers</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-400 font-medium hover:text-white">
                <BarChart2 className="w-3 h-3" />
                <span>Reports</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-400 font-medium hover:text-white">
                <Settings className="w-3 h-3" />
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Canvas */}
        <div className="flex-1 bg-[#F8FAFC] p-2.5 sm:p-3 overflow-hidden">
          {/* Mini Topbar */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
            <div className="relative flex-1 max-w-[200px]">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                placeholder="Search products, suppliers..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-0.5 text-[9.5px] text-slate-600 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative p-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                <Bell className="w-3 h-3" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-0.5 right-0.5" />
              </div>
              <div className="w-5 h-5 rounded-full bg-[#00966B] border border-emerald-300 text-white flex items-center justify-center text-[8px] font-bold">
                👤
              </div>
            </div>
          </div>

          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5">
            {/* Metric 1 */}
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00966B] flex items-center justify-center flex-shrink-0">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[8.5px] text-slate-500 font-medium leading-none">
                  Total Products
                </p>
                <p className="text-xs font-black text-slate-900 mt-0.5">1,248</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[8.5px] text-slate-500 font-medium leading-none">
                  Low Stock Items
                </p>
                <p className="text-xs font-black text-red-600 mt-0.5">18</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00966B] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[8.5px] text-slate-500 font-medium leading-none">
                  Total Sales
                </p>
                <p className="text-xs font-black text-slate-900 mt-0.5">₹2,48,500</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[8.5px] text-slate-500 font-medium leading-none">
                  Pending Orders
                </p>
                <p className="text-xs font-black text-amber-600 mt-0.5">7</p>
              </div>
            </div>
          </div>

          {/* Dashboard Split: Recent Products & Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Left Table: Recent Products */}
            <div className="sm:col-span-6 bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[10px] font-bold text-slate-800">
                  Recent Products
                </h4>
                <span className="text-[8.5px] font-bold text-[#00966B] cursor-pointer hover:underline">
                  View All
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[8px] text-slate-400 font-bold uppercase border-b border-slate-100">
                    <th className="pb-1 font-semibold">Product</th>
                    <th className="pb-1 font-semibold text-center">Stock</th>
                    <th className="pb-1 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[9.5px]">
                  {/* Item 1 */}
                  <tr>
                    <td className="py-1.5 flex items-center gap-1.5">
                      <span className="text-sm">🥛</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[90px]">
                        Amul Fresh Milk 1L
                      </span>
                    </td>
                    <td className="py-1.5 text-center font-bold text-emerald-600">
                      45
                    </td>
                    <td className="py-1.5 text-right">
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[8px] inline-flex items-center gap-0.5">
                        • In Stock
                      </span>
                    </td>
                  </tr>

                  {/* Item 2 */}
                  <tr>
                    <td className="py-1.5 flex items-center gap-1.5">
                      <span className="text-sm">🍚</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[90px]">
                        India Gate Basmati Rice 5kg
                      </span>
                    </td>
                    <td className="py-1.5 text-center font-bold text-red-500">
                      8
                    </td>
                    <td className="py-1.5 text-right">
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold text-[8px] inline-flex items-center gap-0.5">
                        • Low Stock
                      </span>
                    </td>
                  </tr>

                  {/* Item 3 */}
                  <tr>
                    <td className="py-1.5 flex items-center gap-1.5">
                      <span className="text-sm">🌻</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[90px]">
                        Sunflower Oil 1L
                      </span>
                    </td>
                    <td className="py-1.5 text-center font-bold text-emerald-600">
                      120
                    </td>
                    <td className="py-1.5 text-right">
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[8px] inline-flex items-center gap-0.5">
                        • In Stock
                      </span>
                    </td>
                  </tr>

                  {/* Item 4 */}
                  <tr>
                    <td className="py-1.5 flex items-center gap-1.5">
                      <span className="text-sm">🥣</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[90px]">
                        Kellogg's Corn Flakes 500g
                      </span>
                    </td>
                    <td className="py-1.5 text-center font-bold text-red-500">
                      5
                    </td>
                    <td className="py-1.5 text-right">
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold text-[8px] inline-flex items-center gap-0.5">
                        • Low Stock
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Sales Area Chart & Stock Donut */}
            <div className="sm:col-span-6 space-y-2">
              {/* Sales Overview Chart */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs relative">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[9.5px] font-bold text-slate-800">
                    Sales Overview
                  </h4>
                  <span className="text-[8px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
                    Last 30 Days <ChevronDown className="w-2.5 h-2.5" />
                  </span>
                </div>

                {/* Tooltip Overlay Badge */}
                <div className="absolute right-3 top-7 z-10 bg-[#032A1C] text-white text-[8.5px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                  <span>₹28,450</span>
                  <span className="text-emerald-400 font-normal">↗ +12%</span>
                </div>

                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={salesPreviewData}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="salesGradPreview" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00966B" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00966B" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 7, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#00966B"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#salesGradPreview)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stock Status Donut Chart */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs">
                <h4 className="text-[9.5px] font-bold text-slate-800 mb-1">
                  Stock Status
                </h4>
                <div className="flex items-center justify-between gap-1">
                  {/* Donut Chart with Centered Count */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockDonutData}
                          dataKey="value"
                          innerRadius={18}
                          outerRadius={28}
                          paddingAngle={2}
                        >
                          {stockDonutData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-black text-slate-900 leading-none">
                        1,248
                      </span>
                      <span className="text-[5.5px] text-slate-400 leading-none mt-0.5">
                        Products
                      </span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="space-y-0.5 text-[8px] flex-1 pl-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        In Stock
                      </span>
                      <span className="font-bold text-slate-800">
                        1,020 (82%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        Low Stock
                      </span>
                      <span className="font-bold text-slate-800">
                        18 (15%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        Out of Stock
                      </span>
                      <span className="font-bold text-slate-800">
                        10 (3%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboardPreview;
