import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronDown, 
  Download, 
  Star, 
  UserPlus, 
  AlertCircle, 
  Moon, 
  SlidersHorizontal, 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';

export default function CustomersView({ customerSegments, overview }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterSegment, setActiveFilterSegment] = useState('All');

  const kpis = overview?.kpis || {
    total_customers: 12450,
    repeat_customer_pct: 42.8
  };

  // Purchase Frequency Bar Chart Data
  const frequencyData = [
    { label: '1 Purchase', count: 5310, pct: '42%' },
    { label: '2 Purchases', count: 3120, pct: '25%' },
    { label: '3-5 Purchases', count: 2150, pct: '17%' },
    { label: '6-10 Purchases', count: 1240, pct: '10%' },
    { label: '10+ Purchases', count: 630, pct: '6%' },
  ];

  const freqPlotTraces = [
    {
      x: frequencyData.map(f => f.label),
      y: frequencyData.map(f => f.count),
      type: 'bar',
      marker: {
        color: ['#6366f1', '#3b82f6', '#14b8a6', '#10b981', '#f97316'],
        borderRadius: 8
      },
      text: frequencyData.map(f => f.pct),
      textposition: 'auto',
      hovertemplate: '%{x}: <b>%{y:,} customers</b> (%{text})<extra></extra>'
    }
  ];

  // Directory Customers List
  const customersList = [
    { id: 'CST-8923', name: 'John Doe', initials: 'JD', segment: 'VIP', purchases: 24, ltv: 12450, lastActive: '2 days ago', status: 'active', color: 'indigo' },
    { id: 'CST-1452', name: 'Alice Smith', initials: 'AS', segment: 'Growth', purchases: 3, ltv: 1200, lastActive: '14 days ago', status: 'active', color: 'emerald' },
    { id: 'CST-9931', name: 'Robert Brown', initials: 'RB', segment: 'Action Needed', purchases: 8, ltv: 3450, lastActive: '45 days ago', status: 'warning', color: 'amber' },
    { id: 'CST-5521', name: 'Priya Sharma', initials: 'PS', segment: 'VIP', purchases: 19, ltv: 9800, lastActive: '1 day ago', status: 'active', color: 'indigo' },
    { id: 'CST-2234', name: 'Rajesh Patel', initials: 'RP', segment: 'Growth', purchases: 2, ltv: 950, lastActive: '18 days ago', status: 'active', color: 'emerald' },
    { id: 'CST-7712', name: 'Kavita Verma', initials: 'KV', segment: 'Inactive', purchases: 1, ltv: 620, lastActive: '92 days ago', status: 'inactive', color: 'slate' }
  ];

  const filteredCustomers = useMemo(() => {
    return customersList.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = activeFilterSegment === 'All' || c.segment === activeFilterSegment;
      return matchesSearch && matchesSegment;
    });
  }, [searchQuery, activeFilterSegment]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and analyze your customer base</p>
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
                customersList.map(e => `${e.id},${e.name},${e.segment},${e.purchases},${e.ltv},${e.lastActive}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "customer_directory.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-full text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Customers</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            {(kpis.total_customers || 12450).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +5.0%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Repeat Rate</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            {Number(kpis.repeat_customer_pct || 42.8).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.3%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Avg Lifetime Value</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹4,250
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingDown className="w-3.5 h-3.5 mr-1" /> -2.1%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Churn Rate</h3>
          <div className="text-3xl font-extrabold text-slate-900">
            8.2%
          </div>
          <p className="text-xs text-slate-400 mt-2">vs previous period</p>
        </div>

      </div>

      {/* Customer Segments Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Segments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* High-Value Regulars */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">VIP</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 relative z-10">High-Value Regulars</h3>
            <p className="text-sm text-slate-500 mb-4 relative z-10">2,340 customers</p>
            <div className="space-y-3 mb-5 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Repeat Rate</span>
                <span className="font-semibold text-slate-900">78%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Avg LTV</span>
                <span className="font-semibold text-slate-900">₹8,420</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveFilterSegment('VIP')}
              className="w-full py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors relative z-10"
            >
              Explore Segment
            </button>
          </div>

          {/* New Customers */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Growth</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 relative z-10">New Customers</h3>
            <p className="text-sm text-slate-500 mb-4 relative z-10">3,120 customers</p>
            <div className="space-y-3 mb-5 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Repeat Rate</span>
                <span className="font-semibold text-slate-900">12%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Avg LTV</span>
                <span className="font-semibold text-slate-900">₹1,850</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveFilterSegment('Growth')}
              className="w-full py-2.5 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors relative z-10"
            >
              Explore Segment
            </button>
          </div>

          {/* At-Risk Customers */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/5 to-orange-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">Action Needed</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 relative z-10">At-Risk Customers</h3>
            <p className="text-sm text-slate-500 mb-4 relative z-10">1,680 customers</p>
            <div className="space-y-3 mb-5 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Repeat Rate</span>
                <span className="font-semibold text-slate-900">25%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Avg LTV</span>
                <span className="font-semibold text-slate-900">₹2,100</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveFilterSegment('Action Needed')}
              className="w-full py-2.5 text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors relative z-10"
            >
              Explore Segment
            </button>
          </div>

          {/* Dormant Customers */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-400/5 to-slate-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white shadow-sm">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">Inactive</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 relative z-10">Dormant Customers</h3>
            <p className="text-sm text-slate-500 mb-4 relative z-10">5,310 customers</p>
            <div className="space-y-3 mb-5 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Repeat Rate</span>
                <span className="font-semibold text-slate-900">0%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Avg LTV</span>
                <span className="font-semibold text-slate-900">₹3,200</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveFilterSegment('Inactive')}
              className="w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors relative z-10"
            >
              Explore Segment
            </button>
          </div>

        </div>
      </div>

      {/* Analysis Section: Cohort Retention Table & Purchase Frequency Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cohort Analysis Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-white to-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cohort Retention</h2>
              <p className="text-sm text-slate-500 mt-1">Customer retention by acquisition month</p>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-lg">Cohort</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold text-center">M0</th>
                  <th className="px-4 py-3 font-semibold text-center">M1</th>
                  <th className="px-4 py-3 font-semibold text-center">M2</th>
                  <th className="px-4 py-3 font-semibold text-center">M3</th>
                  <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">M4</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">Jan 2024</td>
                  <td className="px-4 py-3 text-slate-600">1,245</td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-100/80 text-emerald-800 py-1.5 rounded text-xs font-semibold">100%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-50 text-emerald-700 py-1.5 rounded text-xs font-semibold">42%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-50 text-emerald-700 py-1.5 rounded text-xs font-semibold">38%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-yellow-50 text-yellow-700 py-1.5 rounded text-xs font-semibold">32%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-yellow-50 text-yellow-700 py-1.5 rounded text-xs font-semibold">28%</div></td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">Feb 2024</td>
                  <td className="px-4 py-3 text-slate-600">980</td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-100/80 text-emerald-800 py-1.5 rounded text-xs font-semibold">100%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-50 text-emerald-700 py-1.5 rounded text-xs font-semibold">45%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-yellow-50 text-yellow-700 py-1.5 rounded text-xs font-semibold">36%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-yellow-50 text-yellow-700 py-1.5 rounded text-xs font-semibold">29%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">Mar 2024</td>
                  <td className="px-4 py-3 text-slate-600">1,420</td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-100/80 text-emerald-800 py-1.5 rounded text-xs font-semibold">100%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-yellow-50 text-yellow-700 py-1.5 rounded text-xs font-semibold">38%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-rose-50 text-rose-700 py-1.5 rounded text-xs font-semibold">25%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">Apr 2024</td>
                  <td className="px-4 py-3 text-slate-600">1,150</td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-100/80 text-emerald-800 py-1.5 rounded text-xs font-semibold">100%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-50 text-emerald-700 py-1.5 rounded text-xs font-semibold">41%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 rounded-bl-lg">May 2024</td>
                  <td className="px-4 py-3 text-slate-600">890</td>
                  <td className="px-2 py-2 text-center"><div className="bg-emerald-100/80 text-emerald-800 py-1.5 rounded text-xs font-semibold">100%</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                  <td className="px-2 py-2 text-center"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                  <td className="px-2 py-2 text-center rounded-br-lg"><div className="bg-slate-50 text-slate-400 py-1.5 rounded text-xs">-</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Frequency Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Purchase Frequency</h2>
              <p className="text-sm text-slate-500 mt-1">Distribution of repeat purchases</p>
            </div>
          </div>
          <div className="p-4 sm:p-6 flex-1 min-h-[300px]">
            <PlotlyChart
              data={freqPlotTraces}
              layout={{
                margin: { t: 20, r: 20, l: 50, b: 40 },
                xaxis: { showgrid: false },
                yaxis: { gridcolor: '#f8fafc' },
                showlegend: false
              }}
              style={{ height: '280px' }}
            />
          </div>
        </div>

      </div>

      {/* Customer Directory List Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-white to-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Directory</h2>
            <p className="text-sm text-slate-500 mt-1">Detailed list of all recorded customers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all w-full sm:w-64"
              />
            </div>
            {activeFilterSegment !== 'All' && (
              <button 
                onClick={() => setActiveFilterSegment('All')}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100"
              >
                Clear Filter ({activeFilterSegment})
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Segment</th>
                <th className="px-6 py-4 font-semibold">Purchases</th>
                <th className="px-6 py-4 font-semibold">LTV</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((cust) => {
                let badgeClass = 'text-indigo-700 bg-indigo-50';
                let avatarBg = 'from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200/50';
                if (cust.segment === 'Growth') {
                  badgeClass = 'text-emerald-700 bg-emerald-50';
                  avatarBg = 'from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200/50';
                } else if (cust.segment === 'Action Needed') {
                  badgeClass = 'text-amber-700 bg-amber-50';
                  avatarBg = 'from-amber-100 to-orange-100 text-amber-700 border-amber-200/50';
                } else if (cust.segment === 'Inactive') {
                  badgeClass = 'text-slate-700 bg-slate-100';
                  avatarBg = 'from-slate-100 to-slate-200 text-slate-700 border-slate-200/50';
                }

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarBg} border flex items-center justify-center font-bold text-xs`}>
                          {cust.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{cust.name}</p>
                          <p className="text-xs text-slate-500">{cust.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {cust.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{cust.purchases}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">₹{cust.ltv.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600">{cust.lastActive}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`w-2 h-2 rounded-full inline-block ${cust.status === 'active' ? 'bg-emerald-500' : cust.status === 'warning' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Directory Pagination */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing 1-{filteredCustomers.length} of 12,450</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors">
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
