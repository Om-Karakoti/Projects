import React, { useState } from 'react';
import PlotlyChart from './PlotlyChart';
import { Cpu, Info, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PredictionsView({ predictions }) {
  if (!predictions || !predictions.points || predictions.points.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-center">
        <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700">Predictive Model Initializing</h3>
        <p className="text-xs text-slate-500">Waiting for transaction features to populate forecast series...</p>
      </div>
    );
  }

  // Separate historical from future forecast points
  const histPoints = predictions.points.filter(p => p.historical_revenue !== null);
  const predPoints = predictions.points.filter(p => p.predicted_revenue !== null);

  const histDates = histPoints.map(p => p.date);
  const histRevs = histPoints.map(p => p.historical_revenue);

  const predDates = predPoints.map(p => p.date);
  const predRevs = predPoints.map(p => p.predicted_revenue);
  const lowerBounds = predPoints.map(p => p.lower_bound);
  const upperBounds = predPoints.map(p => p.upper_bound);

  // Plotly Data for Historical vs Predicted Sales
  const forecastPlotData = [
    // Historical Line
    {
      x: histDates,
      y: histRevs,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Historical Actual Sales (₹)',
      line: { color: '#002970', width: 2.5 },
      marker: { color: '#002970', size: 5 },
    },
    // Upper Bound (Invisible line for fill)
    {
      x: predDates,
      y: upperBounds,
      type: 'scatter',
      mode: 'lines',
      marker: { color: '#444' },
      line: { width: 0 },
      showlegend: false,
      hoverinfo: 'skip',
    },
    // Lower Bound with shaded uncertainty band
    {
      x: predDates,
      y: lowerBounds,
      type: 'scatter',
      mode: 'lines',
      fill: 'tonexty',
      fillcolor: 'rgba(0, 186, 242, 0.18)',
      line: { width: 0 },
      name: '80% Prediction Interval',
      hoverinfo: 'skip',
    },
    // Predicted Sales Line (Dashed)
    {
      x: predDates,
      y: predRevs,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'XGBoost Predicted Sales (₹)',
      line: { color: '#00BAF2', width: 2.5, dash: 'dash' },
      marker: { color: '#00BAF2', size: 6, symbol: 'diamond' },
    }
  ];

  const forecastLayout = {
    title: { text: 'Historical Actuals vs. 14-Day XGBoost Sales Forecast', font: { size: 14, color: '#1e293b' } },
    xaxis: { title: 'Date', gridcolor: '#f1f5f9' },
    yaxis: { title: 'Daily Revenue (₹)', gridcolor: '#f1f5f9' },
    legend: { orientation: 'h', y: -0.25, x: 0.15 },
    height: 380,
  };

  // Feature Importance Chart
  const features = predictions.top_predictive_features || [];
  const featNames = features.map(f => f.feature.replace(/_/g, ' ')).reverse();
  const featScores = features.map(f => f.importance).reverse();

  const featurePlotData = [
    {
      y: featNames,
      x: featScores,
      type: 'bar',
      orientation: 'h',
      marker: { color: '#0284c7' },
      text: featScores.map(s => `${(s * 100).toFixed(1)}%`),
      textposition: 'auto',
    }
  ];

  const featureLayout = {
    title: { text: 'Key Drivers Influencing XGBoost Predictions', font: { size: 13, color: '#1e293b' } },
    margin: { l: 150, r: 20, t: 30, b: 40 },
    xaxis: { title: 'Relative Importance Score', gridcolor: '#f1f5f9' },
    height: 260,
  };

  const metrics = predictions.evaluation_metrics || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Machine Learning Sales Forecasting</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#002970] border border-sky-200">
              {predictions.model_name}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Trained on time-series lag signals, moving averages, and weekly seasonality
          </p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
        <PlotlyChart data={forecastPlotData} layout={forecastLayout} />
      </div>

      {/* Model Performance & Feature Drivers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Model Evaluation Metrics */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Model Validation Performance</h3>
            <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Backtested Split
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">MAPE (Error %)</span>
              <span className="text-lg font-black text-slate-800 font-mono">
                {metrics.mape !== undefined ? `${metrics.mape}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Mean Abs % Error</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">MAE</span>
              <span className="text-lg font-black text-slate-800 font-mono">
                ₹{metrics.mae?.toLocaleString('en-IN') || 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Mean Abs Error</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">RMSE</span>
              <span className="text-lg font-black text-slate-800 font-mono">
                ₹{metrics.rmse?.toLocaleString('en-IN') || 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Root Mean Sq Err</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Integrity Standard:</strong> Forecasts represent statistical projections modeled from historical data. 
              They highlight expected baseline seasonality and are not guaranteed commitments.
            </div>
          </div>
        </div>

        {/* Feature Importance Plot */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <PlotlyChart data={featurePlotData} layout={featureLayout} />
        </div>
      </div>
    </div>
  );
}
