'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, AreaChart, Area,
} from 'recharts';

const COLORS = ['#4B3AFF', '#FF3D9A', '#2FE3A3', '#FFB020', '#3AC1FF', '#A960FF', '#FF5A4E', '#E8FF3D', '#FF6600', '#00FFFF'];

function NeuTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-[3px] border-[var(--ink)] rounded-xl p-3 shadow-[4px_4px_0px_0px_var(--ink)]">
      <p className="font-bold text-sm mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

export function NeuBarChart({ data, bars = [], height = 300, xKey = 'name', stacked = false }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,18,31,0.08)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fontWeight: 600, fill: '#666' }} axisLine={{ stroke: '#14121F', strokeWidth: 2 }} />
        <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#666' }} axisLine={{ stroke: '#14121F', strokeWidth: 2 }} />
        <Tooltip content={<NeuTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700, paddingTop: '8px' }} />
        {bars.map((bar, i) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.label || bar.key} fill={bar.color || COLORS[i]}
            radius={[6, 6, 0, 0]} stackId={stacked ? 'stack' : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NeuLineChart({ data, lines = [], height = 300, xKey = 'name' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,18,31,0.08)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fontWeight: 600, fill: '#666' }} axisLine={{ stroke: '#14121F', strokeWidth: 2 }} />
        <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#666' }} axisLine={{ stroke: '#14121F', strokeWidth: 2 }} />
        <Tooltip content={<NeuTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700, paddingTop: '8px' }} />
        {lines.map((line, i) => (
          <Line key={line.key} type="monotone" dataKey={line.key} name={line.label || line.key}
            stroke={line.color || COLORS[i]} strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: 'white' }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function NeuPieChart({ data, height = 300, nameKey = 'name', valueKey = 'value', donut = false }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%"
          innerRadius={donut ? '50%' : 0} outerRadius="80%" strokeWidth={3} stroke="#14121F"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#14121F', strokeWidth: 2 }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<NeuTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function NeuRadarChart({ data, dataKeys = [], height = 300, angleKey = 'subject' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(20,18,31,0.15)" />
        <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 11, fontWeight: 700, fill: '#14121F' }} />
        <PolarRadiusAxis tick={{ fontSize: 10, fill: '#999' }} />
        {dataKeys.map((dk, i) => (
          <Radar key={dk.key} name={dk.label || dk.key} dataKey={dk.key}
            stroke={dk.color || COLORS[i]} fill={dk.color || COLORS[i]} fillOpacity={0.2} strokeWidth={2} />
        ))}
        <Tooltip content={<NeuTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function NeuAreaChart({ data, areas = [], height = 300, xKey = 'name' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,18,31,0.08)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fontWeight: 600, fill: '#666' }} axisLine={{ stroke: '#14121F', strokeWidth: 2 }} />
        <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#666' }} axisLine={{ stroke: '#14121F', strokeWidth: 2 }} />
        <Tooltip content={<NeuTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700, paddingTop: '8px' }} />
        {areas.map((area, i) => (
          <Area key={area.key} type="monotone" dataKey={area.key} name={area.label || area.key}
            stroke={area.color || COLORS[i]} fill={area.color || COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
