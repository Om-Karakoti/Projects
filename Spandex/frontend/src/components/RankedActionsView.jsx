import React, { useState } from 'react';
import { 
  Sparkles, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ListChecks, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Clock, 
  Zap, 
  Settings2, 
  Bot, 
  Share2,
  Calendar,
  Check
} from 'lucide-react';

export default function RankedActionsView({ recommendations = [], onApplyAction }) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [minConfidence, setMinConfidence] = useState(70);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 Days');
  const [selectedImplementation, setSelectedImplementation] = useState('quick');
  const [autoExecute, setAutoExecute] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState('rec-1');
  const [appliedActions, setAppliedActions] = useState({});

  // Fallback enriched recommendations matching the draft exactly
  const standardRecommendations = [
    {
      id: 'rec-1',
      rank: 1,
      category: 'PROMOTIONS',
      confidence: 92,
      action: recommendations[0]?.action || 'Launch Weekend Flash Sale on Electronics',
      problem_detected: recommendations[0]?.problem_detected || 'Declining Sales in Electronics',
      reasoning: recommendations[0]?.reasoning || 'Transaction volume for electronics dropped by 12% over 14 days. Historical data shows a 10% discount during weekends recovers 85% of similar volume drops.',
      target_segment: 'Dormant Electronics Buyers',
      segment_size: '1,420 users',
      suggested_timing: 'Start: Friday 5 PM — End: Sunday 11:59 PM',
      estimated_business_impact: '+₹45,000 - ₹60,000',
      gradient: 'from-blue-500 to-indigo-600',
      confidenceColor: 'text-indigo-700 bg-indigo-50 border-indigo-100'
    },
    {
      id: 'rec-2',
      rank: 2,
      category: 'OPERATIONS',
      confidence: 84,
      action: recommendations[1]?.action || 'Optimize Weekend Staffing Levels',
      problem_detected: 'Surge in Weekend Footfall',
      reasoning: 'Model predicts a 20% surge in demand this coming Saturday based on historical pattern matching and local events.',
      target_segment: 'All In-Store Shoppers',
      segment_size: '3,800+ visits',
      suggested_timing: 'Saturday 11 AM - 8 PM',
      estimated_business_impact: 'Smooth Operations',
      gradient: 'from-purple-500 to-pink-500',
      confidenceColor: 'text-purple-700 bg-purple-50 border-purple-100'
    },
    {
      id: 'rec-3',
      rank: 3,
      category: 'INVENTORY',
      confidence: 78,
      action: recommendations[2]?.action || 'Reorder Fast-Moving SKU: Wireless Earbuds',
      problem_detected: 'Stockout Risk',
      reasoning: 'Current inventory trajectory suggests stockout within 4 days. Lead time is typically 3 days from supplier.',
      target_segment: 'Tech Buyers',
      segment_size: 'High-Demand SKU',
      suggested_timing: 'Within next 24 hours',
      estimated_business_impact: 'Prevent ₹1.2L Loss',
      gradient: 'from-orange-400 to-rose-500',
      confidenceColor: 'text-orange-700 bg-orange-50 border-orange-100'
    },
    {
      id: 'rec-4',
      rank: 4,
      category: 'RETENTION',
      confidence: 71,
      action: recommendations[3]?.action || 'Create Loyalty Reward for Q1 Cohort',
      problem_detected: 'Cohort Churn',
      reasoning: 'Addresses dropping retention rate. A ₹200 cashback offer has a high probability of reactivating this segment.',
      target_segment: 'Q1 Customers',
      segment_size: '840 users',
      suggested_timing: 'Launch this Monday',
      estimated_business_impact: '+₹35,000 LTV',
      gradient: 'from-emerald-400 to-teal-500',
      confidenceColor: 'text-emerald-700 bg-emerald-50 border-emerald-100'
    }
  ];

  const filteredRecs = standardRecommendations.filter(rec => {
    if (rec.confidence < minConfidence) return false;
    if (selectedCategory !== 'All Categories' && rec.category !== selectedCategory.toUpperCase()) return false;
    return true;
  });

  const handleApply = (rec) => {
    setAppliedActions(prev => ({ ...prev, [rec.id]: true }));
    if (onApplyAction) onApplyAction(rec);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ranked Actions</h1>
          </div>
          <p className="text-sm text-slate-500 ml-11">
            Hybrid AI recommendation engine combining ML predictions and business rules.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60">
          
          {/* Category Filter */}
          <div className="w-full sm:w-auto relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              <option>All Categories</option>
              <option>Promotions</option>
              <option>Operations</option>
              <option>Inventory</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

          {/* Confidence Slider */}
          <div className="w-full sm:w-48 px-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Confidence</span>
              <span className="text-indigo-600">{minConfidence}%+</span>
            </div>
            <input 
              type="range" 
              min="60" 
              max="95" 
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

          {/* Date Range */}
          <div className="w-full sm:w-auto relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Quarter</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat 1 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full -mr-12 -mt-12"></div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <ListChecks className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Recommendations</h3>
            <div className="text-2xl font-extrabold text-slate-900">
              12 <span className="text-sm font-semibold text-indigo-600 ml-1">Actions</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-bl-full -mr-12 -mt-12"></div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Avg Confidence Score</h3>
            <div className="text-2xl font-extrabold text-slate-900">
              81.4%
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-bl-full -mr-12 -mt-12"></div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Est. Revenue Impact</h3>
            <div className="text-2xl font-extrabold text-emerald-600">
              +₹2.8L-₹3.2L
            </div>
          </div>
        </div>

      </div>

      {/* Ranked List */}
      <div className="space-y-6">
        {filteredRecs.map((rec) => {
          const isExpanded = expandedCardId === rec.id;
          const isApplied = appliedActions[rec.id];

          if (isExpanded) {
            return (
              /* Expanded View (Card 1 / Selected Card) */
              <div 
                key={rec.id}
                className="bg-white rounded-3xl border border-indigo-100 shadow-[0_8px_30px_rgba(99,102,241,0.12)] relative overflow-hidden flex flex-col transition-all"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${rec.gradient}`}></div>
                
                <div className="flex-1 p-6 md:p-8 pl-8 md:pl-10">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-lg shadow-sm">
                        Rank #{rec.rank}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${rec.confidenceColor}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confidence: {rec.confidence}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {rec.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Problem */}
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {rec.action}
                  </h2>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Addresses: {rec.problem_detected}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reasoning</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {rec.reasoning}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Segment</h4>
                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-500" />
                          {rec.target_segment} <span className="text-xs text-slate-500 font-normal">({rec.segment_size})</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Suggested Timing</h4>
                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          {rec.suggested_timing}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 inline-block">
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Est. Revenue Impact</h4>
                        <p className="text-lg font-extrabold text-emerald-700">{rec.estimated_business_impact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Implementation Options */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Implementation Options</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Option 1: Quick Setup */}
                      <div 
                        onClick={() => setSelectedImplementation('quick')}
                        className={`rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all ${
                          selectedImplementation === 'quick'
                            ? 'bg-white border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                          RECOMMENDED
                        </div>
                        <Zap className="w-6 h-6 text-indigo-500 mb-2" />
                        <h5 className="text-sm font-bold text-slate-900">Quick Setup</h5>
                        <p className="text-xs text-slate-500 mt-1">Uses AI-generated copy and standard targeting. ~3 mins.</p>
                      </div>

                      {/* Option 2: Custom Setup */}
                      <div 
                        onClick={() => setSelectedImplementation('custom')}
                        className={`rounded-xl p-4 cursor-pointer transition-colors ${
                          selectedImplementation === 'custom'
                            ? 'bg-white border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Settings2 className="w-6 h-6 text-slate-400 mb-2" />
                        <h5 className="text-sm font-bold text-slate-900">Custom Setup</h5>
                        <p className="text-xs text-slate-500 mt-1">Manually adjust discount rates and segment rules.</p>
                      </div>

                      {/* Option 3: Auto-Execute */}
                      <div 
                        onClick={() => setAutoExecute(!autoExecute)}
                        className={`rounded-xl p-4 cursor-pointer transition-colors flex flex-col justify-between ${
                          autoExecute
                            ? 'bg-indigo-50/50 border-2 border-indigo-400'
                            : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <Bot className="w-6 h-6 text-slate-400 mb-2" />
                          <h5 className="text-sm font-bold text-slate-900">Auto-Execute</h5>
                          <p className="text-xs text-slate-500 mt-1">Let Spandex AI run this automatically.</p>
                        </div>
                        <div className={`mt-3 rounded-full w-10 h-5 relative transition-colors ${autoExecute ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${autoExecute ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => handleApply(rec)}
                      disabled={isApplied}
                      className={`px-6 py-3 rounded-full text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                        isApplied 
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Offer Active &amp; Live</span>
                        </>
                      ) : (
                        <span>Implement Now</span>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: rec.action, text: rec.reasoning });
                        } else {
                          navigator.clipboard.writeText(`${rec.action}: ${rec.reasoning}`);
                          alert("Action copied to clipboard!");
                        }
                      }}
                      className="px-6 py-3 rounded-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>

                    <button 
                      onClick={() => setExpandedCardId(null)}
                      className="ml-auto text-sm font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                    >
                      Hide Details <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          }

          /* Collapsed View (Cards 2, 3, 4) */
          return (
            <div 
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${rec.gradient}`}></div>
              <div className="p-5 md:p-6 pl-7 md:pl-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      Rank #{rec.rank}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${rec.confidenceColor}`}>
                      Confidence: {rec.confidence}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {rec.action}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                    {rec.reasoning}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:w-auto shrink-0">
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Est. Impact</span>
                    <span className="text-sm font-bold text-slate-800">{rec.estimated_business_impact}</span>
                  </div>
                  <button 
                    onClick={() => setExpandedCardId(rec.id)}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    View Details <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* End of List Load More */}
      <div className="text-center pt-4 pb-8">
        <button className="px-6 py-2.5 rounded-full text-sm font-semibold text-slate-500 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors">
          Load More Actions
        </button>
      </div>

    </div>
  );
}
