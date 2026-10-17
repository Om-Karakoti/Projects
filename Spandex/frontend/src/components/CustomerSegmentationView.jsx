import React from 'react';
import PlotlyChart from './PlotlyChart';
import { Users, Crown, AlertTriangle, Sparkles, UserCheck } from 'lucide-react';

export default function CustomerSegmentationView({ segmentation }) {
  if (!segmentation || !segmentation.segments || segmentation.segments.length === 0) {
    return null;
  }

  const { segments, total_customers_analyzed, clustering_algorithm } = segmentation;

  // Construct scatter points for Plotly
  const scatterTraces = segments.map((seg, idx) => {
    const pts = seg.sample_points || [];
    const colorPalette = ['#002970', '#00BAF2', '#f59e0b', '#ef4444'];
    const segColor = colorPalette[idx % colorPalette.length];

    return {
      x: pts.map(p => p.recency),
      y: pts.map(p => p.monetary),
      text: pts.map(p => `Customer: ${p.customer_id}<br>Recency: ${p.recency} days<br>Frequency: ${p.frequency} visits<br>Spend: ₹${p.monetary}`),
      mode: 'markers',
      name: `${seg.segment_name} (${seg.percentage_of_customers}%)`,
      marker: {
        size: pts.map(p => Math.min(Math.max(p.frequency * 4, 8), 26)),
        color: segColor,
        opacity: 0.75,
        line: { color: '#ffffff', width: 1 }
      },
      hoverinfo: 'text',
      type: 'scatter',
    };
  });

  const scatterLayout = {
    title: { text: 'Customer Behavioral Map (Recency vs. Total Spend, Bubble Size = Frequency)', font: { size: 14, color: '#1e293b' } },
    xaxis: { title: 'Recency (Days since last visit - Lower is Better)', gridcolor: '#f1f5f9' },
    yaxis: { title: 'Monetary Value (Total Spend ₹)', gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.25, x: 0.05 },
    height: 380,
  };

  const getSegmentIcon = (name) => {
    if (name.includes('Champions') || name.includes('Loyalists')) return <Crown className="w-5 h-5 text-amber-500" />;
    if (name.includes('At-Risk') || name.includes('Lapsing')) return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    if (name.includes('Potential') || name.includes('Regulars')) return <UserCheck className="w-5 h-5 text-sky-500" />;
    return <Users className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">AI Customer Behavioral Segmentation</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {clustering_algorithm}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Unsupervised clustering over {total_customers_analyzed} customer RFM profiles
          </p>
        </div>
      </div>

      {/* Segment Persona Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map((seg, idx) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                {getSegmentIcon(seg.segment_name)}
              </div>
              <span className="text-xs font-black text-[#002970] bg-sky-50 px-2 py-0.5 rounded-md">
                {seg.percentage_of_customers}%
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">{seg.segment_name}</h3>
              <span className="text-[11px] text-slate-500">{seg.customer_count} unique patrons</span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Avg Recency:</span>
                <strong className="text-slate-800">{seg.avg_recency_days} days</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Avg Visits:</span>
                <strong className="text-slate-800">{seg.avg_frequency} times</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Avg Spend:</span>
                <strong className="text-slate-800">₹{seg.avg_monetary.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plotly RFM Scatter Visual */}
      <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
        <PlotlyChart data={scatterTraces} layout={scatterLayout} />
      </div>
    </div>
  );
}
