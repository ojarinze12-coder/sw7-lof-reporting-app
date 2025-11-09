import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <p>No data to display in chart.</p>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const chartHeight = 300;
  const barWidth = 35;
  const barMargin = 15;
  const chartWidth = data.length * (barWidth + barMargin);
  const valueLabelOffset = 5;
  const nameLabelOffset = 10;
  const yAxisLabelWidth = 50;

  // Function to create nice tick values for the Y-axis
  const getTicks = (max: number) => {
    if (max === 0) return [0];
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const residual = max / magnitude;
    let step;
    if (residual > 5) {
      step = magnitude;
    } else if (residual > 2) {
      step = magnitude / 2;
    } else {
      step = magnitude / 5;
    }
    const ticks = [];
    for (let i = 0; i <= max; i += step) {
      ticks.push(Math.round(i));
    }
    // ensure the max value is included if it's not a multiple of step
    if (ticks[ticks.length - 1] < max) {
         ticks.push(ticks[ticks.length - 1] + step);
    }
    return ticks;
  };
  
  const niceMaxValue = getTicks(maxValue).pop() || maxValue;
  const ticks = getTicks(niceMaxValue);

  return (
    <div className="w-full">
        <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
        <div className="overflow-x-auto p-4 bg-slate-50 rounded-lg">
            <svg width={chartWidth + yAxisLabelWidth} height={chartHeight + 50} aria-label={title}>
                <g transform={`translate(${yAxisLabelWidth}, 0)`}>
                    {/* Y-axis Lines and Labels */}
                    {ticks.map((tick, i) => {
                        const y = chartHeight - (tick / niceMaxValue) * chartHeight;
                        return (
                            <g key={i}>
                                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                                <text x="-10" y={y + 5} textAnchor="end" fontSize="12" fill="#64748b">
                                    {tick.toLocaleString()}
                                </text>
                            </g>
                        );
                    })}
                    
                    {/* Bars and Labels */}
                    {data.map((d, i) => {
                        const barHeight = d.value > 0 ? (d.value / niceMaxValue) * chartHeight : 0;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight;

                        return (
                            <g key={d.name} className="group">
                                <rect 
                                    x={x} 
                                    y={y} 
                                    width={barWidth} 
                                    height={barHeight} 
                                    fill="#fbbf24" 
                                    className="transition-all duration-300 group-hover:fill-amber-500"
                                />
                                <text 
                                    x={x + barWidth / 2} 
                                    y={y - valueLabelOffset} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fontWeight="bold"
                                    fill="#475569"
                                    className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                >
                                    {d.value.toLocaleString()}
                                </text>
                                <text 
                                    x={x + barWidth / 2} 
                                    y={chartHeight + nameLabelOffset} 
                                    dy="0.75em" 
                                    textAnchor="middle" 
                                    fontSize="11" 
                                    fill="#475569"
                                >
                                    {d.name}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    </div>
  );
};

export default BarChart;