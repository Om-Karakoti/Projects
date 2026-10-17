import React, { useState } from 'react';
import { 
  IndianRupee, 
  CreditCard, 
  Receipt, 
  UserCheck, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronDown, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  Zap,
  Clock,
  Layers
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';

export default function DashboardView({
  overview,
  predictions,
  issues = [],
  recommendations = [],
  onNavigateTab,
  onApplyAction
}) {
  const [trendGranularity, setTrendGranularity] = useState('daily');
  const [selectedWindow, setSelectedWindow] = useState('Last 30 Days');

  const kpis = overview?.kpis || {
    total_revenue: 1245000,
    total_transactions: 4231,
    avg_transaction_value: 294.25,
    repeat_customer_pct: 42.8,
    growth_rate_pct: 14.2
  };

  // Build Plotly Revenue & XGBoost Prediction Traces
  const salesTrend = overview?.sales_trend || [];
  const historicalDates = salesTrend.map(d => d.date);
  const historicalRevenues = salesTrend.map(d => d.revenue);

  const forecastData = predictions?.forecast || [];
  const forecastDates = forecastData.map(d => d.date);
  const forecastRevenues = forecastData.map(d => d.predicted_revenue);
  const forecastUpper = forecastData.map(d => d.upper_bound);
  const forecastLower = forecastData.map(d => d.lower_bound);

  const revenuePlotTraces = [
    {
      x: historicalDates,
      y: historicalRevenues,
      name: 'Actual Revenue',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#6366f1', width: 3, shape: 'spline' },
      fill: 'tozeroy',
      fillcolor: 'rgba(99, 102, 241, 0.08)',
      hovertemplate: '<b>%{x}</b><br>Actual: ₹%{y:,.0f}<extra></extra>'
    }
  ];

  if (forecastDates.length > 0) {
    // Confidence interval band
    revenuePlotTraces.push({
      x: [...forecastDates, ...forecastDates.slice().reverse()],
      y: [...forecastUpper, ...forecastLower.slice().reverse()],
      fill: 'toself',
      fillcolor: 'rgba(249, 115, 22, 0.12)',
      line: { color: 'transparent' },
      hoverinfo: 'skip',
      showlegend: false,
      name: 'Confidence Range'
    });

    // Forecast line
    revenuePlotTraces.push({
      x: forecastDates,
      y: forecastRevenues,
      name: 'XGBoost Prediction',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f97316', width: 2.5, dash: 'dot', shape: 'spline' },
      marker: { size: 5, color: '#f97316' },
      hovertemplate: '<b>%{x}</b><br>Forecast: ₹%{y:,.0f}<extra></extra>'
    });
  }

  // Peak sales heatmap traces
  const heatmapData = overview?.peak_sales_heatmap || {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    hours: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
    matrix: [
      [12, 18, 35, 45, 30, 78, 65, 22],
      [15, 22, 40, 48, 32, 85, 72, 25],
      [14, 20, 38, 42, 34, 82, 68, 24],
      [18, 25, 45, 50, 40, 92, 80, 28],
      [25, 35, 60, 68, 58, 120, 110, 45],
      [30, 45, 75, 85, 72, 145, 138, 60],
      [28, 40, 70, 80, 65, 130, 120, 50]
    ]
  };

  const peakHeatmapTraces = [
    {
      z: heatmapData.matrix,
      x: heatmapData.hours,
      y: heatmapData.days,
      type: 'heatmap',
      colorscale: [
        [0, '#f8fafc'],
        [0.2, '#e0e7ff'],
        [0.5, '#818cf8'],
        [0.8, '#4f46e5'],
        [1, '#312e81']
      ],
      showscale: false,
      hovertemplate: 'Day: %{y}<br>Hour: %{x}<br>Transactions: %{z}<extra></extra>'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Merchant Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Your business performance at a glance</p>
        </div>
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <select 
            value={selectedWindow}
            onChange={(e) => setSelectedWindow(e.target.value)}
            className="pl-11 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-full text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
          >
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>Last Quarter</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI Card 1: Total Revenue */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +{kpis.growth_rate_pct || 14.2}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1 relative z-10">Total Revenue</h3>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{(kpis.total_revenue || 1245000).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 relative z-10">vs previous 30 days</p>
        </div>

        {/* KPI Card 2: Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +8.4%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1 relative z-10">Transactions</h3>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {(kpis.total_transactions || 4231).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 relative z-10">vs previous 30 days</p>
        </div>

        {/* KPI Card 3: Avg. Transaction */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/5 to-rose-500/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="flex items-center text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingDown className="w-3.5 h-3.5 mr-1" /> -2.1%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1 relative z-10">Avg. Transaction</h3>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{Number(kpis.avg_transaction_value || 294.25).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 relative z-10">vs previous 30 days</p>
        </div>

        {/* KPI Card 4: Repeat Customers */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +5.0%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1 relative z-10">Repeat Customers</h3>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {Number(kpis.repeat_customer_pct || 42.8).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 relative z-10">vs previous 30 days</p>
        </div>

      </div>

      {/* Main Charts Section (Plotly) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Primary Chart: Revenue & Predictions */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue &amp; Prediction Trends</h2>
              <p className="text-sm text-slate-500 mt-1">Historical actuals vs XGBoost predictions</p>
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
              data={revenuePlotTraces}
              layout={{
                margin: { t: 20, r: 20, l: 50, b: 40 },
                xaxis: { showgrid: false, zeroline: false },
                yaxis: { 
                  gridcolor: '#f1f5f9',
                  tickprefix: '₹',
                  zeroline: false 
                },
                legend: { orientation: 'h', y: 1.12, x: 0.05 },
                hovermode: 'x unified'
              }}
              style={{ height: '340px' }}
            />
          </div>
        </div>

        {/* Secondary Chart: Peak Sales Heatmap */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-white to-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Peak Sales Analysis</h2>
            <p className="text-sm text-slate-500 mt-1">Heatmap of transaction volume</p>
          </div>
          <div className="p-4 sm:p-6 flex-1 min-h-[350px] flex items-center justify-center">
            <PlotlyChart
              data={peakHeatmapTraces}
              layout={{
                margin: { t: 20, r: 20, l: 50, b: 40 },
                xaxis: { showgrid: false },
                yaxis: { showgrid: false },
              }}
              style={{ height: '340px' }}
            />
          </div>
        </div>

      </div>

      {/* AI Insights & Recommendations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* AI Detected Issues Preview */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-rose-50/50 to-orange-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="text-rose-600 w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">AI-Detected Business Issues</h2>
            </div>
            <button 
              onClick={() => onNavigateTab('issues')}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 group transition-colors"
            >
              View Details 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="p-4 flex-1 bg-slate-50/30">
            <ul className="space-y-3">
              {/* Issue Item 1 */}
              <li 
                onClick={() => onNavigateTab('issues')}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-rose-400 to-orange-400"></div>
                <div className="pl-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {issues[0]?.title || 'Declining Sales: Electronics Category'}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {issues[0]?.description || 'Transaction volume for electronics has dropped by 12% over the last 14 days compared to the previous period.'}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                      Data-backed
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Detected 2 days ago
                    </span>
                  </div>
                </div>
              </li>

              {/* Issue Item 2 */}
              <li 
                onClick={() => onNavigateTab('issues')}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-yellow-500"></div>
                <div className="pl-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {issues[1]?.title || 'Decreasing Repeat Purchases'}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {issues[1]?.description || 'Customers acquired in Q1 are showing a 5% lower return rate than the historical average for cohort retention.'}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                      Cohort Analysis
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Detected 4 days ago
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Ranked Recommendations Preview */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <Sparkles className="text-emerald-600 w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Ranked Actions</h2>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full shadow-2xs">
              Hybrid Engine
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 bg-slate-50/30">
            {/* Recommendation 1 (Rank #1) */}
            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-transparent pointer-events-none"></div>
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
              
              <div className="flex justify-between items-start pl-2 relative z-10">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 rounded-md shadow-2xs">
                      Rank #1
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      Confidence: {recommendations[0]?.confidence_score ? Math.round(recommendations[0].confidence_score * 100) : 87}%
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-2">
                    {recommendations[0]?.action || 'Run Targeted Promotion on Electronics'}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1.5 mb-4 leading-relaxed">
                    {recommendations[0]?.reasoning || 'To counter the 12% drop, offer a 10% discount to customers who previously bought electronics but haven’t returned in 30 days.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2 pl-2 relative z-10">
                <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-900">Est. Impact:</span> {recommendations[0]?.estimated_business_impact || '+₹45k-₹60k Rev'}
                </div>
                <button 
                  onClick={() => onApplyAction(recommendations[0] || { id: 'rec-1', action: 'Targeted Promotion' })}
                  className="text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  Create Offer
                </button>
              </div>
            </div>

            {/* Recommendation 2 (Rank #2) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                      Rank #2
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                      Confidence: {recommendations[1]?.confidence_score ? Math.round(recommendations[1].confidence_score * 100) : 72}%
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-2">
                    {recommendations[1]?.action || 'Optimize Weekend Staffing/Inventory'}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1.5 mb-4 leading-relaxed">
                    {recommendations[1]?.reasoning || 'Model predicts a 20% surge in demand this coming Saturday based on historical pattern matching.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-900">Timing:</span> Next 48 hours
                </div>
                <button 
                  onClick={() => onNavigateTab('recommendations')}
                  className="text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-2xs transition-all"
                >
                  View Data
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
