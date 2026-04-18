import { useState } from 'react'
import axios from 'axios'
import ProgressRing from '../components/ProgressRing'

const card = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.90)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
}

const PHASE_DESC = {
  Luteal:    (conf) => `Model predicted Luteal phase with ${conf}% confidence. HRV suppression and elevated wrist temperature are consistent with progesterone-driven activity.`,
  Menstrual: (conf) => `Model predicted Menstrual phase with ${conf}% confidence. Low HRV variability and stable temperature pattern suggest early follicular onset.`,
  Ovulation: (conf) => `Model predicted Ovulation phase with ${conf}% confidence based on HRV, temperature and breathing patterns.`,
}

const HORMONE_PROFILE = {
  Luteal:    { estrogen: 40, progesterone: 90, lh: 15 },
  Menstrual: { estrogen: 15, progesterone: 10, lh: 20 },
  Ovulation: { estrogen: 95, progesterone: 25, lh: 90 },
}

function HormoneBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs w-24 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.50)' }}>{label}</p>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }} />
      </div>
      <p className="text-xs w-8 text-right" style={{ color: 'rgba(0,0,0,0.35)' }}>
        {value >= 70 ? 'High' : value >= 35 ? 'Mid' : 'Low'}
      </p>
    </div>
  )
}

const PHASE_META = {
  Luteal:    { color: '#EAB308', statusType: 'warning', statusTitle: 'Luteal Phase Detected' },
  Menstrual: { color: '#EF4444', statusType: 'alert',   statusTitle: 'Menstrual Phase Detected' },
  Ovulation: { color: '#00D4A0', statusType: 'good',    statusTitle: 'Ovulation Phase Detected' },
}

const STATUS = {
  good:    { color: '#22C55E', border: 'rgba(34,197,94,0.22)',  bg: 'rgba(34,197,94,0.07)' },
  warning: { color: '#EAB308', border: 'rgba(234,179,8,0.22)', bg: 'rgba(234,179,8,0.07)' },
  alert:   { color: '#EF4444', border: 'rgba(239,68,68,0.22)',  bg: 'rgba(239,68,68,0.07)' },
}


const PHASES = [
  { label: 'Menstrual',  days: [1, 5]   },
  { label: 'Follicular', days: [6, 13]  },
  { label: 'Ovulation',  days: [14, 16] },
  { label: 'Luteal',     days: [17, 28] },
]

function getCurrentPhaseIndex(day) {
  return PHASES.findIndex(p => day >= p.days[0] && day <= p.days[1])
}

export default function InsightPage({ data, onUpload }) {
  const [dragging, setDragging] = useState(false)
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

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (!data) {
    return (
      <div className="px-5 pt-14 pb-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A0A0A' }}>Insight</h1>
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.38)' }}>Upload your Fitbit export to begin</p>
        </div>

        <div
          className="rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
          style={{ ...card, border: dragging ? '2px solid #0A0A0A' : '2px dashed rgba(0,0,0,0.15)', minHeight: 200 }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input id="file-input" type="file" accept=".csv" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.10)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {loading
            ? <p className="font-medium" style={{ color: '#0A0A0A' }}>Analyzing...</p>
            : <>
                <p className="font-semibold text-sm" style={{ color: '#0A0A0A' }}>Upload Fitbit Sense Export</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.38)' }}>Drag & drop or tap to select CSV</p>
              </>
          }
        </div>
      </div>
    )
  }

  const meta = PHASE_META[data.current_phase] || PHASE_META['Luteal']
  const phaseIndex = PHASES.findIndex(p => p.label === data.current_phase)
  const cycleProgress = (data.cycle_day / data.total_days) * 100

  return (
    <div className="px-5 pt-14 pb-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A0A0A' }}>Insight</h1>
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.38)' }}>Cycle day {data.cycle_day}</p>
        </div>
        <button onClick={() => onUpload(null)}
          className="text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.45)' }}>
          New Upload
        </button>
      </div>

      {/* Cycle Phase Card */}
      <div className="rounded-2xl p-4" style={card}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.38)' }}>Current Phase</p>
        <div className="flex justify-between">
          {PHASES.map((p, i) => (
            <span key={p.label}
              className="text-sm font-semibold px-3 py-1.5 rounded-xl"
              style={{
                color: i === phaseIndex ? '#fff' : 'rgba(0,0,0,0.25)',
                background: i === phaseIndex ? meta.color : 'transparent',
              }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center py-2">
        <ProgressRing score={data.confidence} size={220} />
        <p className="text-xs uppercase tracking-widest mt-3" style={{ color: 'rgba(0,0,0,0.35)' }}>
          Model Confidence
        </p>
      </div>

      {/* Status card */}
      <div className="rounded-2xl p-4" style={{ background: meta.color }}>
        <div className="flex items-start gap-3">
          <div>
            <p className="font-semibold text-sm" style={{ color: '#fff' }}>{meta.statusTitle}</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
              {(PHASE_DESC[data.current_phase] || PHASE_DESC['Luteal'])(data.confidence)}
            </p>
          </div>
        </div>
      </div>

      {/* Hormone Profile */}
      {(() => {
        const h = HORMONE_PROFILE[data.current_phase] || HORMONE_PROFILE['Luteal']
        return (
          <div className="rounded-2xl p-4 space-y-3" style={card}>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>Hormone Profile</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.30)' }}>Estimated</p>
            </div>
            <HormoneBar label="Estrogen (E3G)"     value={h.estrogen}      color="#00D4A0" />
            <HormoneBar label="Progesterone (PdG)" value={h.progesterone}  color="#EAB308" />
            <HormoneBar label="LH"                 value={h.lh}            color="#EF4444" />
            <p className="text-[10px] pt-1" style={{ color: 'rgba(0,0,0,0.25)' }}>
              Estimated based on predicted phase
            </p>
          </div>
        )
      })()}
    </div>
  )
}
