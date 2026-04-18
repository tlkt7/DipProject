import { useState } from 'react'
import axios from 'axios'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const card = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.90)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
}

const PHASE_COLORS = { Luteal: '#EAB308', Menstrual: '#EF4444', Ovulation: '#00D4A0' }

function CycleChart({ predictions }) {
  return (
    <div className="rounded-2xl p-4 mb-3" style={card}>
      <p className="text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Cycle Timeline</p>
      <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.38)' }}>28-day phase prediction</p>
      <div className="flex gap-0.5">
        {predictions.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm"
              style={{ height: 28, background: PHASE_COLORS[d.phase] || '#ccc', opacity: d.confidence / 100 }}
              title={`Day ${d.day}: ${d.phase} (${d.confidence}%)`}
            />
            {d.day % 5 === 0 && (
              <span className="text-[8px]" style={{ color: 'rgba(0,0,0,0.35)' }}>{d.day}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-3">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.45)' }}>{phase}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ title, subtitle, value, unit, context, chartData, chartKey, chartColor }) {
  return (
    <div className="rounded-2xl p-5 mb-3" style={card}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>{title}</p>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.32)' }}>{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold tracking-tight" style={{ color: '#0A0A0A' }}>{value}</span>
          <span className="text-sm ml-1" style={{ color: 'rgba(0,0,0,0.35)' }}>{unit}</span>
        </div>
      </div>
      {chartData && (
        <div style={{ height: 48 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" hide />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.95)' }}
                formatter={(v) => [v + ' ' + unit, title]}
                labelFormatter={(l) => `Day ${l}`}
              />
              <Line type="monotone" dataKey={chartKey} stroke={chartColor}
                strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(0,0,0,0.38)' }}>{context}</p>
    </div>
  )
}

export default function MetricsPage({ data, onUpload }) {
  const [loading, setLoading] = useState(false)

  async function handleFile(file) {
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post('http://127.0.0.1:8000/predict', form)
      onUpload(res.data)
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setLoading(false)
  }

  if (!data) {
    return (
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#0A0A0A' }}>Bio-Metrics</h1>
        <div className="rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer"
          style={{ ...card, border: '2px dashed rgba(0,0,0,0.15)', minHeight: 200 }}
          onClick={() => document.getElementById('file-input-metrics').click()}>
          <input id="file-input-metrics" type="file" accept=".csv" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          {loading
            ? <p style={{ color: '#0A0A0A' }}>Analyzing...</p>
            : <p className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.45)' }}>Upload CSV to see metrics</p>
          }
        </div>
      </div>
    )
  }

  const m = data.metrics
  const preds = data.daily_predictions

  // Строим данные для графиков из daily_predictions (используем confidence как proxy)
  const chartBase = preds.map(d => ({ day: d.day, confidence: d.confidence }))

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: '#0A0A0A' }}>Bio-Metrics</h1>
        <p className="text-sm" style={{ color: 'rgba(0,0,0,0.38)' }}>Biomarker snapshot | Day {data.cycle_day}</p>
      </div>

      <CycleChart predictions={preds} />

      <MetricCard
        title="HRV | Overnight RMSSD"
        subtitle="Heart Rate Variability"
        value={m.hrv}
        unit="ms"
        context="Higher HRV indicates parasympathetic dominance. Suppression is common in luteal phase due to progesterone."
      />

      <MetricCard
        title="WST | Diff from baseline"
        subtitle="Wrist Temperature"
        value={m.temperature_diff > 0 ? '+' + m.temperature_diff : m.temperature_diff}
        unit="°C"
        context="Post-ovulation temperature rise of +0.2–0.5°C is a key indicator of luteal phase onset."
      />

      <MetricCard
        title="RR | Full sleep average"
        subtitle="Breathing Rate"
        value={m.breathing_rate}
        unit="/min"
        context="Respiratory rate tends to increase in luteal phase due to progesterone's stimulatory effect on breathing."
      />

      <MetricCard
        title="LF/HF Ratio"
        subtitle="Autonomic balance"
        value={m.lf_hf_ratio}
        unit=""
        context="LF/HF reflects sympathetic vs parasympathetic balance. Elevated values correlate with hormonal activity."
      />

      {/* Correlation card */}
      <div className="rounded-2xl p-4 mb-3" style={card}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>Biomarker Correlations</p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.30)' }}>Correlation</p>
        </div>
        {[
          { biomarker: 'HRV',   hormone: 'Progesterone', r: -0.187, dir: '↓' },
          { biomarker: 'RR',    hormone: 'Progesterone', r: +0.152, dir: '↑' },
          { biomarker: 'RR',    hormone: 'Estrogen',     r: +0.180, dir: '↑' },
          { biomarker: 'LF/HF', hormone: 'Estrogen',     r: +0.119, dir: '↑' },
          { biomarker: 'LF/HF', hormone: 'Progesterone', r: +0.125, dir: '↑' },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#0A0A0A' }}>{row.biomarker}</span>
              <span className="text-xs" style={{ color: 'rgba(0,0,0,0.38)' }}>↔ {row.hormone}</span>
            </div>
            <span className="text-sm font-bold"
              style={{ color: row.r < 0 ? '#EF4444' : '#00D4A0' }}>
              {row.dir} {row.r > 0 ? '+' : ''}{row.r}
            </span>
          </div>
        ))}
        <p className="text-[10px] mt-3" style={{ color: 'rgba(0,0,0,0.30)' }}>Notebook 03</p>
      </div>
    </div>
  )
}
