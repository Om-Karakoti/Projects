import React, { useState } from 'react';
import { 
  Radar, 
  AlertCircle, 
  AlertOctagon, 
  AlertTriangle, 
  Activity, 
  Info, 
  Clock, 
  ChevronDown, 
  ArrowRight, 
  TrendingDown, 
  UserMinus, 
  MoreHorizontal,
  Tag,
  Calendar
} from 'lucide-react';

export default function IssuesView({ issues = [], onNavigateTab, onSelectRecommendation }) {
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 14 Days');

  // Standard fallback issues matching the SuperDesign draft with live overrides
  const standardIssues = [
    {
      id: 'issue-1',
      severity: 'Critical',
      title: issues[0]?.title || 'Declining Sales: Electronics Category',
      description: issues[0]?.description || 'Transaction volume for electronics has dropped significantly over the last 14 days compared to the previous period, indicating a potential market shift or competitive pressure.',
      detected: 'Detected 2 hrs ago',
      metric1Label: 'Volume Drop',
      metric1Value: '-12.4%',
      metric2Label: 'Revenue at Risk',
      metric2Value: '₹1.2L',
      actionLabel: 'Investigate',
      actionTarget: 'recommendations',
      color: 'rose'
    },
    {
      id: 'issue-2',
      severity: 'High',
      title: issues[1]?.title || 'Decreasing Repeat Purchases',
      description: issues[1]?.description || 'Customers acquired during the Q1 promotional campaign are showing a noticeably lower return rate than your historical average for cohort retention.',
      detected: 'Detected 1 day ago',
      metric1Label: 'Return Rate Gap',
      metric1Value: '-5.2%',
      metric2Label: 'Impacted Cohort',
      metric2Value: '840 users',
      actionLabel: 'View AI Recommendation',
      actionTarget: 'recommendations',
      color: 'orange'
    },
    {
      id: 'issue-3',
      severity: 'Medium',
      title: issues[2]?.title || 'Low Performing Time Block',
      description: issues[2]?.description || 'Transaction velocity between Tuesday 2:00 PM and 5:00 PM has consistently underperformed compared to sector baselines for 3 consecutive weeks.',
      detected: 'Detected 3 days ago',
      metric1Label: 'Variance',
      metric1Value: '-34%',
      metric2Label: 'Pattern Confidence',
      metric2Value: '92%',
      actionLabel: 'Analyze Time Slots',
      actionTarget: 'analytics',
      color: 'amber'
    },
    {
      id: 'issue-4',
      severity: 'Low',
      title: issues[3]?.title || 'Shift in Premium Purchases',
      description: issues[3]?.description || 'A slight shift detected in the Beauty category where returning customers are purchasing basic tier products instead of premium items compared to last month.',
      detected: 'Detected today',
      metric1Label: 'AOV Change',
      metric1Value: '-2.8%',
      metric2Label: 'Category Focus',
      metric2Value: 'Health & Beauty',
      actionLabel: 'View Segmentation',
      actionTarget: 'customers',
      color: 'blue'
    }
  ];

  const filteredIssues = standardIssues.filter(item => {
    if (selectedSeverity !== 'All Severities' && item.severity.toLowerCase() !== selectedSeverity.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Radar className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              AI-Detected Issues
            </h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Our engine constantly monitors your transaction streams. Here are the potential anomalies and business risks identified that require your attention.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          
          {/* Severity Select */}
          <div className="relative">
            <AlertCircle className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="pl-10 pr-9 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option>All Severities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="w-px h-6 bg-slate-200"></div>

          {/* Category Select */}
          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-9 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option>All Categories</option>
              <option>Sales Volume</option>
              <option>Retention</option>
              <option>Operations</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

          {/* Date Range Select */}
          <div className="relative hidden sm:block">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="pl-10 pr-9 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option>Last 7 Days</option>
              <option>Last 14 Days</option>
              <option>Last 30 Days</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIssues.map((issue) => {
          const isCritical = issue.severity === 'Critical';
          const isHigh = issue.severity === 'High';
          const isMedium = issue.severity === 'Medium';
          const isLow = issue.severity === 'Low';

          let borderGrad = 'from-rose-500 to-red-600';
          let glowGrad = 'from-rose-500/5 to-red-600/5';
          let badgeStyle = 'bg-rose-50 text-rose-700 border-rose-100';
          let badgeIcon = AlertOctagon;
          let metricBoxStyle = 'bg-rose-50/50 border-rose-100/50 text-rose-600';

          if (isHigh) {
            borderGrad = 'from-orange-400 to-amber-500';
            glowGrad = 'from-orange-500/5 to-amber-500/5';
            badgeStyle = 'bg-orange-50 text-orange-700 border-orange-100';
            badgeIcon = AlertTriangle;
            metricBoxStyle = 'bg-orange-50/50 border-orange-100/50 text-orange-600';
          } else if (isMedium) {
            borderGrad = 'from-amber-300 to-yellow-500';
            glowGrad = 'from-amber-400/5 to-yellow-500/5';
            badgeStyle = 'bg-amber-50 text-amber-700 border-amber-100';
            badgeIcon = Activity;
            metricBoxStyle = 'bg-amber-50/50 border-amber-100/50 text-amber-600';
          } else if (isLow) {
            borderGrad = 'from-blue-400 to-indigo-500';
            glowGrad = 'from-blue-500/5 to-indigo-500/5';
            badgeStyle = 'bg-blue-50 text-blue-700 border-blue-100';
            badgeIcon = Info;
            metricBoxStyle = 'bg-blue-50/50 border-blue-100/50 text-blue-600';
          }

          const BadgeIconComponent = badgeIcon;

          return (
            <div 
              key={issue.id}
              className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${borderGrad}`}></div>
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${glowGrad} rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110 pointer-events-none`}></div>

              {/* Meta Top Bar */}
              <div className="flex justify-between items-center pl-4 mb-4 relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border shadow-xs ${badgeStyle}`}>
                  <BadgeIconComponent className="w-3.5 h-3.5" /> {issue.severity}
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" /> {issue.detected}
                </span>
              </div>

              {/* Content */}
              <div className="pl-4 flex-1 relative z-10">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {issue.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {issue.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`rounded-2xl p-4 border ${metricBoxStyle}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-75 mb-1">
                      {issue.metric1Label}
                    </p>
                    <p className="text-2xl font-extrabold flex items-center gap-1">
                      <TrendingDown className="w-5 h-5" /> {issue.metric1Value}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {issue.metric2Label}
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {issue.metric2Value}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pl-4 mt-auto pt-5 border-t border-slate-50 flex items-center justify-between relative z-10">
                {isCritical ? (
                  <button 
                    onClick={() => onNavigateTab('recommendations')}
                    className="text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 px-6 py-2.5 rounded-full shadow-md shadow-rose-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    Investigate <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isHigh ? (
                  <button 
                    onClick={() => onNavigateTab('recommendations')}
                    className="text-sm font-bold text-slate-700 bg-white border-2 border-orange-100 hover:border-orange-200 hover:bg-orange-50 px-6 py-2.5 rounded-full transition-all flex items-center gap-2"
                  >
                    View AI Recommendation
                  </button>
                ) : (
                  <button 
                    onClick={() => onNavigateTab(issue.actionTarget)}
                    className="text-sm font-bold text-slate-700 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 px-6 py-2.5 rounded-full transition-all flex items-center gap-2"
                  >
                    {issue.actionLabel}
                  </button>
                )}

                <button 
                  title="Options"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
