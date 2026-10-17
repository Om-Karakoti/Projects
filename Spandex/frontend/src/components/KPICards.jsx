import React from 'react';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Users, ShoppingBag, TrendingUp, Clock, Flame, Award } from 'lucide-react';

export default function KPICards({ kpis, windowDays }) {
  if (!kpis) return null;

  const isGrowthPositive = kpis.sales_growth_rate >= 0;
  const growthColor = isGrowthPositive ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200';
  const GrowthIcon = isGrowthPositive ? ArrowUpRight : ArrowDownRight;

  const topProduct = kpis.best_performing_products?.[0];
  const topCategory = kpis.best_performing_categories?.[0];

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#002970]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{kpis.total_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full border ${growthColor}`}>
              <GrowthIcon className="w-3.5 h-3.5" />
              {Math.abs(kpis.sales_growth_rate)}%
            </span>
            <span className="text-[11px] text-slate-500">
              vs prior {windowDays}D (₹{Math.abs(kpis.revenue_change_amount || 0).toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#002970]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.total_transactions?.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <span className={`font-semibold ${kpis.transactions_change_count >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {kpis.transactions_change_count >= 0 ? `+${kpis.transactions_change_count}` : kpis.transactions_change_count} orders
            </span>
            <span>across {windowDays} days</span>
          </div>
        </div>

        {/* Average Transaction Value (ATV) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Transaction Value</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{kpis.average_transaction_value?.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">Avg Basket</span>
            <span>Typical ticket size</span>
          </div>
        </div>

        {/* Repeat Customer Percentage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repeat Customer Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.repeat_customer_percentage}%
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
              {kpis.repeat_customer_percentage >= 40 ? 'High Loyalty' : 'Retention Target'}
            </span>
            <span>Patrons with &gt; 1 order</span>
          </div>
        </div>
      </div>

      {/* Secondary Highlights Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-slate-900 via-[#002970] to-slate-900 text-white p-4 rounded-xl shadow-sm">
        {/* Peak Sales Day & Hour */}
        <div className="flex items-center gap-3.5 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 pr-0 md:pr-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-sky-200 uppercase font-semibold tracking-wider">Peak Trading Window</div>
            <div className="text-base font-bold text-white">
              {kpis.peak_sales_day || 'Saturday'} at {kpis.peak_sales_hour}:00 IST
            </div>
            <div className="text-[11px] text-slate-300">Highest sales velocity & customer footfall</div>
          </div>
        </div>

        {/* Best Performing Product */}
        <div className="flex items-center gap-3.5 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 pr-0 md:pr-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-sky-200 uppercase font-semibold tracking-wider">Top Revenue Product</div>
            <div className="text-base font-bold text-white truncate" title={topProduct?.product_name}>
              {topProduct?.product_name || 'N/A'}
            </div>
            <div className="text-[11px] text-slate-300">
              ₹{topProduct?.revenue?.toLocaleString('en-IN')} ({topProduct?.units} units sold)
            </div>
          </div>
        </div>

        {/* Best Performing Category */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sky-300 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-sky-200 uppercase font-semibold tracking-wider">Top Category</div>
            <div className="text-base font-bold text-white truncate">
              {topCategory?.category || 'N/A'}
            </div>
            <div className="text-[11px] text-slate-300">
              ₹{topCategory?.revenue?.toLocaleString('en-IN')} contribution
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
