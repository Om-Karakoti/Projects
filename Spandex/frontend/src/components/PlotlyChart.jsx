import React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export default function PlotlyChart({ data, layout, config, style, className }) {
  const defaultLayout = {
    autosize: true,
    margin: { t: 30, r: 20, l: 50, b: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { family: 'inherit', color: '#475569', size: 12 },
    hovermode: 'closest',
    showlegend: true,
    legend: { orientation: 'h', y: -0.2, x: 0.1 },
    ...layout,
  };

  const defaultConfig = {
    responsive: true,
    displayModeBar: false,
    ...config,
  };

  return (
    <div className={`w-full overflow-hidden ${className || ''}`}>
      <Plot
        data={data}
        layout={defaultLayout}
        config={defaultConfig}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%', minHeight: '320px', ...style }}
      />
    </div>
  );
}
