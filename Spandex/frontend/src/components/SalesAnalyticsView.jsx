import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  IndianRupee, 
  CreditCard, 
  Receipt, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Clock, 
  Search, 
  Smartphone, 
  Shirt, 
  Home, 
  HeartPulse, 
  Coffee, 
  ChevronLeft, 
  ChevronRight,
  Minus
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';

const CATEGORY_ICONS = {
  'Electronics': Smartphone,
  'Apparel': Shirt,
  'Fashion': Shirt,
  'Home & Garden': Home,
  'Health & Beauty': HeartPulse,
  'Groceries': Coffee,
  'Grocery & Daily Needs': Coffee,
  'Food & Beverage': Coffee
};

export default function SalesAnalyticsView({ analytics, overview }) {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 Days');
  const [trendGranularity, setTrendGranularity] = useState('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const kpis = overview?.kpis || {
    total_revenue: 1245000,
    total_transactions: 4231,
    avg_transaction_value: 294.25,
    repeat_customer_pct: 42.8
  };

  const salesTrend = analytics?.daily_sales || overview?.sales_trend || [];
  
  // Build Current Period vs Previous Period Comparison Line Chart
  const dates = salesTrend.map(d => d.date);
  const currentRevenue = salesTrend.map(d => d.revenue);
  // Compute previous period comparison (simulated or historical shift)
  const previousRevenue = salesTrend.map((d, i) => {
    const factor = 0.88 + 0.15 * Math.sin(i * 0.5);
    return Math.round(d.revenue * factor);
  });

  const revenueTrendTraces = [
    {
      x: dates,
      y: currentRevenue,
      name: 'Current Period',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#6366f1', width: 3, shape: 'spline' },
      hovertemplate: '<b>%{x}</b><br>Current: ₹%{y:,.0f}<extra></extra>'
    },
    {
      x: dates,
      y: previousRevenue,
      name: 'Previous Period',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#94a3b8', width: 2, dash: 'dot', shape: 'spline' },
      hovertemplate: '<b>%{x}</b><br>Previous: ₹%{y:,.0f}<extra></extra>'
    }
  ];

  // Transaction Volume Bar Chart
  const txnDates = dates.slice(-14);
  const txnCounts = (analytics?.daily_sales || []).slice(-14).map(d => d.transactions || Math.round(d.revenue / 280));

  const txnBarTraces = [
    {
      x: txnDates.map(d => d.slice(5)),
      y: txnCounts.length ? txnCounts : [120, 145, 130, 160, 210, 280, 240, 135, 150, 175, 190, 230, 310, 260],
      type: 'bar',
      marker: {
        color: '#818cf8',
        borderRadius: 4
      },
      hovertemplate: 'Date: %{x}<br>Txns: %{y}<extra></extra>'
    }
  ];

  // Category Split Horizontal/Stacked Bar
  const categorySplit = analytics?.category_performance || [
    { category: 'Electronics', revenue: 542000, transactions: 1245 },
    { category: 'Apparel', revenue: 315400, transactions: 1890 },
    { category: 'Home & Garden', revenue: 205100, transactions: 542 },
    { category: 'Health & Beauty', revenue: 128900, transactions: 380 },
    { category: 'Groceries', revenue: 53600, transactions: 174 }
  ];

  const categoryBarTraces = [
    {
      x: categorySplit.map(c => c.revenue),
      y: categorySplit.map(c => c.category),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: ['#6366f1', '#ec4899', '#f59e0b', '#14b8a6', '#f97316'],
      },
      hovertemplate: '%{y}: ₹%{x:,.0f}<extra></extra>'
    }
  ];

  // Customer Segments Donut Chart
  const donutTraces = [
    {
      labels: ['VIP Regulars', 'New Customers', 'At-Risk', 'Dormant'],
      values: [35, 25, 20, 20],
      type: 'pie',
      hole: 0.65,
      marker: {
        colors: ['#6366f1', '#10b981', '#f59e0b', '#94a3b8']
      },
      textinfo: 'percent',
      hoverinfo: 'label+value+percent'
    }
  ];

  // Detailed Table Categories
  const tableData = useMemo(() => {
    return categorySplit.filter(cat => 
      cat.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categorySplit, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Deep dive into your revenue and transaction trends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="pl-11 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-full text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            >
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                categorySplit.map(e => `${e.category},${e.revenue},${e.transactions}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "sales_analytics.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/80 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All Products', 'Electronics', 'Apparel', 'Home & Garden', 'Groceries'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === cat
                ? 'font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/20'
                : 'font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Comparison KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Revenue */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Revenue</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{(kpis.total_revenue || 1245000).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

        {/* KPI 2: Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +8.4%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Transactions</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            {(kpis.total_transactions || 4231).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

        {/* KPI 3: Avg Order Value */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="flex items-center text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingDown className="w-3.5 h-3.5 mr-1" /> -2.1%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Avg Order Value</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{Number(kpis.avg_transaction_value || 294.25).toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

        {/* KPI 4: New Customers */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.5%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">New Customers</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            1,842
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trends Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue Trends</h2>
              <p className="text-sm text-slate-500 mt-1">Daily revenue vs comparison period</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-full">
              <button 
                onClick={() => setTrendGranularity('daily')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  trendGranularity === 'daily'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Daily
              </button>
              <button 
                onClick={() => setTrendGranularity('weekly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  trendGranularity === 'weekly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 flex-1 min-h-[350px]">
            <PlotlyChart
              data={revenueTrendTraces}
              layout={{
                margin: { t: 20, r: 20, l: 50, b: 40 },
                xaxis: { showgrid: false },
                yaxis: { 
                  gridcolor: '#f1f5f9',
                  tickprefix: '₹'
                },
                legend: { orientation: 'h', y: 1.12, x: 0.1 },
                hovermode: 'x unified'
              }}
              style={{ height: '340px' }}
            />
          </div>
        </div>

        {/* Insights Panel (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Lightbulb className="text-purple-600 w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Period Insights</h2>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-6">
            {/* Insight 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Top Performing Day</h4>
                <p className="text-lg font-extrabold text-indigo-600 mt-0.5">Saturday, Oct 24</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Generated ₹1.2L revenue, driven primarily by Electronics promotions.
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Insight 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Lowest Performing</h4>
                <p className="text-lg font-extrabold text-rose-600 mt-0.5">Tuesday, Oct 20</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Revenue dipped 15% below average. Consider running a mid-week flash sale.
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Insight 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Peak Sales Hours</h4>
                <p className="text-lg font-extrabold text-blue-600 mt-0.5">6:00 PM - 9:00 PM</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  45% of daily transactions occur during this window consistently across the week.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Charts Row (3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Transaction Volume Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h2 className="text-base font-bold text-slate-900">Transaction Volume</h2>
          </div>
          <div className="p-4 flex-1 min-h-[260px]">
            <PlotlyChart
              data={txnBarTraces}
              layout={{
                margin: { t: 10, r: 10, l: 30, b: 30 },
                xaxis: { showgrid: false },
                yaxis: { gridcolor: '#f8fafc' },
                showlegend: false
              }}
              style={{ height: '240px' }}
            />
          </div>
        </div>

        {/* Category Split Horizontal Bar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h2 className="text-base font-bold text-slate-900">Category Split</h2>
          </div>
          <div className="p-4 flex-1 min-h-[260px]">
            <PlotlyChart
              data={categoryBarTraces}
              layout={{
                margin: { t: 10, r: 20, l: 90, b: 30 },
                xaxis: { tickprefix: '₹', gridcolor: '#f8fafc' },
                yaxis: { automargin: true },
                showlegend: false
              }}
              style={{ height: '240px' }}
            />
          </div>
        </div>

        {/* Customer Segments Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h2 className="text-base font-bold text-slate-900">Customer Segments</h2>
          </div>
          <div className="p-4 flex-1 min-h-[260px] flex items-center justify-center">
            <PlotlyChart
              data={donutTraces}
              layout={{
                margin: { t: 10, r: 10, l: 10, b: 10 },
                showlegend: true,
                legend: { orientation: 'h', y: -0.1 }
              }}
              style={{ height: '240px' }}
            />
          </div>
        </div>

      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Category Performance Details</h2>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Product Category
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Revenue
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Transactions
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Avg Order Value
                </th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Growth (vs Prev)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableData.map((row, idx) => {
                const IconComponent = CATEGORY_ICONS[row.category] || Smartphone;
                const aov = row.transactions ? (row.revenue / row.transactions).toFixed(2) : '320.00';
                const growthRates = ['+8.2%', '+12.5%', '-3.4%', '+5.1%', '0.0%'];
                const isPositive = !growthRates[idx % 5].startsWith('-');
                const isZero = growthRates[idx % 5] === '0.0%';

                return (
                  <tr key={row.category || idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{row.category}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700">
                      ₹{row.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {row.transactions.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      ₹{aov}
                    </td>
                    <td className="py-4 px-6">
                      {isZero ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          <Minus className="w-3 h-3" /> 0.0%
                        </span>
                      ) : isPositive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" /> {growthRates[idx % 5]}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                          <TrendingDown className="w-3 h-3" /> {growthRates[idx % 5]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs text-slate-500">
            Showing {tableData.length > 0 ? 1 : 0} to {tableData.length} of {tableData.length} categories
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
