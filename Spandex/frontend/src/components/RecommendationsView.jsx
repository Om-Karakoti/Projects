import React, { useState } from 'react';
import { Target, Zap, Clock, ShieldCheck, TrendingUp, Check, Play, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function RecommendationsView({ recommendations, merchantId, onActionSimulated }) {
  const [appliedMap, setAppliedMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center">
        <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-700">No Immediate Interventions Required</h3>
        <p className="text-xs text-slate-400">All key business metrics are trending within optimal thresholds.</p>
      </div>
    );
  }

  const handleApply = async (recId) => {
    try {
      setLoadingMap(prev => ({ ...prev, [recId]: true }));
      await api.simulateAction(merchantId, recId, 'apply');
      setAppliedMap(prev => ({ ...prev, [recId]: true }));
      if (onActionSimulated) onActionSimulated(recId);
    } catch (err) {
      console.error('Failed to log recommendation action:', err);
    } finally {
      setLoadingMap(prev => ({ ...prev, [recId]: false }));
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-800 border-sky-200';
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'PROMOTION':
        return 'bg-blue-100 text-blue-700';
      case 'RETENTION':
        return 'bg-purple-100 text-purple-700';
      case 'INVENTORY':
        return 'bg-amber-100 text-amber-700';
      case 'PRICING':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Ranked Hybrid Business Recommendations</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#002970] border border-sky-200">
              {recommendations.length} Prioritized Actions
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Synthesizes customer behavior (RFM), XGBoost predictive models, and Paytm merchant business rules
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isApplied = appliedMap[rec.id];
          const isLoading = loadingMap[rec.id];

          return (
            <div
              key={rec.id}
              className={`rounded-xl border transition-all p-5 ${
                rec.priority_rank === 1
                  ? 'border-sky-400 bg-gradient-to-br from-sky-50/40 via-white to-white shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Main Content */}
                <div className="space-y-3 flex-1">
                  {/* Badges Ribbon */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#002970] text-white text-xs font-black flex items-center justify-center shrink-0">
                      #{rec.priority_rank}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityStyle(rec.priority_level)}`}>
                      {rec.priority_level} PRIORITY
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getCategoryBadge(rec.category)}`}>
                      {rec.category}
                    </span>
                    {rec.priority_rank === 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-600 fill-amber-600" /> Top Opportunity
                      </span>
                    )}
                  </div>

                  {/* Recommended Action Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {rec.recommended_action}
                  </h3>

                  {/* Problem & Supporting Reasoning */}
                  <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800">Root Issue Addressed:</span> {rec.problem_detected}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Supporting Calculations:</span> {rec.supporting_data}
                    </div>
                  </div>

                  {/* Operational Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-[#00BAF2] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block">Target Audience:</span>
                        <span className="text-slate-600">{rec.target_customer_segment}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#002970] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block">Suggested Timing:</span>
                        <span className="text-slate-600">{rec.suggested_timing}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Impact & Model Confidence */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                        {rec.estimated_business_impact}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span>Confidence:</span>
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-[#002970] rounded-full"
                            style={{ width: `${rec.confidence_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-slate-800">
                          {Math.round(rec.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="shrink-0 flex sm:flex-col justify-end gap-2 pt-2 md:pt-0">
                  {isApplied ? (
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-xs cursor-default"
                    >
                      <Check className="w-4 h-4" />
                      Enacted in Store
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(rec.id)}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg bg-[#002970] hover:bg-[#003893] text-white shadow-sm hover:shadow transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span>Logging...</span>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Simulate Action</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
