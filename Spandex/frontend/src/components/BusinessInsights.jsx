import React from 'react';
import { AlertTriangle, AlertCircle, Info, TrendingDown, Clock, ShoppingCart, Repeat, CheckCircle } from 'lucide-react';

export default function BusinessInsights({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-center">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Healthy Merchant Operations</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          No critical anomalies or severe revenue contractions detected. Trailing transaction velocities are within nominal ranges.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getProblemIcon = (type) => {
    switch (type) {
      case 'DECLINING_SALES':
        return <TrendingDown className="w-5 h-5 text-rose-600" />;
      case 'DECREASING_REPEAT_PURCHASES':
        return <Repeat className="w-5 h-5 text-amber-600" />;
      case 'UNDERPERFORMING_PRODUCTS':
        return <ShoppingCart className="w-5 h-5 text-purple-600" />;
      case 'LOW_PERFORMING_PERIODS':
        return <Clock className="w-5 h-5 text-sky-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">AI-Detected Business Roadblocks</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {issues.length} Issues Flagged
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Algorithmic diagnostics backed by mathematical calculations from historical transaction records
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-sky-300 hover:shadow-xs transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-2xs">
                  {getProblemIcon(issue.problem_type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{issue.title}</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Metric: {issue.metric_name}</span>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getSeverityBadge(issue.severity)}`}>
                {issue.severity}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {issue.description}
            </p>

            {/* Evidence & Calculated Metrics */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pb-1.5 border-b border-slate-100">
                <span>Observed Current</span>
                <span>Prior Baseline</span>
                <span>Delta</span>
              </div>
              <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                <span>{typeof issue.current_value === 'number' && issue.current_value > 500 ? `₹${issue.current_value.toLocaleString('en-IN')}` : issue.current_value}</span>
                <span className="text-slate-500">{typeof issue.previous_value === 'number' && issue.previous_value > 500 ? `₹${issue.previous_value.toLocaleString('en-IN')}` : issue.previous_value}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-sans font-bold ${issue.percentage_change < 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {issue.percentage_change}%
                </span>
              </div>
              <div className="pt-1.5 text-[11px] text-slate-600 leading-normal flex items-start gap-1.5 bg-slate-50 p-2 rounded">
                <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span><strong>Mathematical Evidence:</strong> {issue.supporting_evidence}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
