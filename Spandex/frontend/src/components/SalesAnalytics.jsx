import React, { useState } from 'react';
import PlotlyChart from './PlotlyChart';
import { BarChart3, Clock, CalendarDays, PieChart, Layers, CreditCard } from 'lucide-react';

export default function SalesAnalytics({ analytics }) {
  const [activeTab, setActiveTab] = useState('trends');

  if (!analytics) return null;

  // Chart 1: Daily Revenue & Order Volume Trends
  const trendDates = analytics.daily_trends.map(t => t.date);
  const trendRevenues = analytics.daily_trends.map(t => t.revenue);
  const trendVolumes = analytics.daily_trends.map(t => t.transaction_count);

  const revenueTrendPlot = [
    {
      x: trendDates,
      y: trendRevenues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Daily Revenue (₹)',
      line: { color: '#002970', width: 2.5 },
      marker: { color: '#00BAF2', size: 5 },
      yaxis: 'y1',
    },
    {
      x: trendDates,
      y: trendVolumes,
      type: 'bar',
      name: 'Orders / Transactions',
      opacity: 0.35,
      marker: { color: '#00BAF2' },
      yaxis: 'y2',
    }
  ];

  const revenueTrendLayout = {
    title: { text: 'Daily Sales & Transaction Volume Trends', font: { size: 14, color: '#1e293b' } },
    xaxis: { title: 'Date', gridcolor: '#f1f5f9' },
    yaxis: {
      title: 'Daily Revenue (₹)',
      titlefont: { color: '#002970' },
      tickfont: { color: '#002970' },
      gridcolor: '#f1f5f9',
    },
    yaxis2: {
      title: 'Transaction Count',
      titlefont: { color: '#0284c7' },
      tickfont: { color: '#0284c7' },
      overlaying: 'y',
      side: 'right',
      showgrid: false,
    },
    legend: { orientation: 'h', y: -0.25, x: 0.2 },
    height: 380,
  };

  // Chart 2: Day of Week Sales Comparison
  const dowDays = analytics.day_of_week_comparison.map(d => d.day);
  const dowRevs = analytics.day_of_week_comparison.map(d => d.revenue);
  const dowColors = dowDays.map(d => (d === 'Saturday' || d === 'Sunday' ? '#002970' : '#38bdf8'));

  const dowPlot = [
    {
      x: dowDays,
      y: dowRevs,
      type: 'bar',
      marker: {
        color: dowColors,
        line: { color: '#002970', width: 1 }
      },
      text: dowRevs.map(r => `₹${r.toLocaleString('en-IN')}`),
      textposition: 'auto',
    }
  ];

  const dowLayout = {
    title: { text: 'Day of Week Sales Comparison (Weekends Highlighted)', font: { size: 14, color: '#1e293b' } },
    xaxis: { title: 'Day of Week' },
    yaxis: { title: 'Total Revenue (₹)', gridcolor: '#f1f5f9' },
    height: 340,
  };

  // Chart 3: Hourly Distribution (0 - 23 hrs)
  const hours = analytics.hourly_distribution.map(h => h.hour_label);
  const hourRevs = analytics.hourly_distribution.map(h => h.revenue);
  const hourTxs = analytics.hourly_distribution.map(h => h.transaction_count);

  const hourlyPlot = [
    {
      x: hours,
      y: hourRevs,
      type: 'bar',
      marker: {
        color: hourRevs.map(v => v < 1000 ? '#fca5a5' : '#00BAF2'),
      },
      name: 'Hourly Revenue',
    }
  ];

  const hourlyLayout = {
    title: { text: 'Trading Hours Footfall & Sales Velocity (Red = Off-Peak Slump)', font: { size: 14, color: '#1e293b' } },
    xaxis: { title: 'Hour of Day (IST)', tickangle: -45 },
    yaxis: { title: 'Hourly Revenue (₹)', gridcolor: '#f1f5f9' },
    height: 340,
  };

  // Chart 4: Product Performance (Horizontal Bar)
  const topProducts = analytics.product_performance.slice(0, 8);
  const prodNames = topProducts.map(p => p.product_name).reverse();
  const prodRevs = topProducts.map(p => p.revenue).reverse();

  const productPlot = [
    {
      y: prodNames,
      x: prodRevs,
      type: 'bar',
      orientation: 'h',
      marker: { color: '#002970' },
      text: prodRevs.map(r => `₹${r.toLocaleString('en-IN')}`),
      textposition: 'inside',
    }
  ];

  const productLayout = {
    title: { text: 'Top Products by Total Revenue', font: { size: 14, color: '#1e293b' } },
    margin: { l: 180, r: 20, t: 30, b: 40 },
    xaxis: { title: 'Revenue (₹)', gridcolor: '#f1f5f9' },
    height: 340,
  };

  // Chart 5: Category Share (Donut)
  const catNames = analytics.category_performance.map(c => c.category);
  const catRevs = analytics.category_performance.map(c => c.revenue);

  const categoryPlot = [
    {
      labels: catNames,
      values: catRevs,
      type: 'pie',
      hole: 0.45,
      marker: {
        colors: ['#002970', '#00BAF2', '#38BDF8', '#7DD3FC', '#F59E0B', '#10B981', '#6366F1', '#EC4899']
      },
      textinfo: 'label+percent',
    }
  ];

  const categoryLayout = {
    title: { text: 'Category Revenue Contribution Share', font: { size: 14, color: '#1e293b' } },
    showlegend: false,
    height: 340,
  };

  // Chart 6: Payment Modes
  const payModes = analytics.payment_mode_breakdown.map(p => p.mode);
  const payCounts = analytics.payment_mode_breakdown.map(p => p.count);

  const paymentPlot = [
    {
      labels: payModes,
      values: payCounts,
      type: 'pie',
      marker: {
        colors: ['#00BAF2', '#002970', '#3b82f6', '#93c5fd', '#cbd5e1']
      },
      textinfo: 'percent+label',
    }
  ];

  const paymentLayout = {
    title: { text: 'Paytm Payment Method Distribution', font: { size: 14, color: '#1e293b' } },
    showlegend: true,
    height: 340,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Comprehensive Sales Analytics</h2>
          <p className="text-xs text-slate-500">Interactive trends, peak trading hours, and category breakdowns</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'trends' ? 'bg-white text-[#002970] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Trends & Daily
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'hours' ? 'bg-white text-[#002970] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Peak Times
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'products' ? 'bg-white text-[#002970] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Products & Catalog
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'payments' ? 'bg-white text-[#002970] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payment Modes
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <PlotlyChart data={revenueTrendPlot} layout={revenueTrendLayout} />
          </div>
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <PlotlyChart data={dowPlot} layout={dowLayout} />
          </div>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="space-y-6">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <PlotlyChart data={hourlyPlot} layout={hourlyLayout} />
          </div>
          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl text-xs text-sky-900 flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#00BAF2] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Operational Insight:</span> Notice the distinct dip between 14:00 (2 PM) and 17:00 (5 PM). 
              Our Hybrid Recommendation Engine automatically targets this window for Paytm Soundbox Happy Hour alerts to increase off-peak traffic.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <PlotlyChart data={productPlot} layout={productLayout} />
          </div>
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <PlotlyChart data={categoryPlot} layout={categoryLayout} />
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <PlotlyChart data={paymentPlot} layout={paymentLayout} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Paytm Acceptance Mix</h3>
            <p className="text-xs text-slate-500">
              Soundbox and QR transactions power the majority of transactions. Immediate audible voice confirmation reduces checkout friction.
            </p>
            <div className="space-y-2">
              {analytics.payment_mode_breakdown.map((pm, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{pm.mode}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{pm.count} transactions</span>
                    <span className="font-bold text-[#002970] bg-sky-50 px-2 py-0.5 rounded">{pm.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
