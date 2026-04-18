const card = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.90)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
}

// Красный → Оранжевый → Жёлтый → Зелёный
function statusColor(value, type) {
  if (type === 'hrv') {
    if (value >= 50) return '#22C55E'
    if (value >= 35) return '#EAB308'
    if (value >= 20) return '#EAB308'
    return '#EF4444'
  }
  if (type === 'breathing') {
    if (value <= 15) return '#22C55E'
    if (value <= 17) return '#EAB308'
    if (value <= 19) return '#EAB308'
    return '#EF4444'
  }
  if (type === 'lf_hf') {
    if (value <= 1.5) return '#22C55E'
    if (value <= 2.5) return '#EAB308'
    if (value <= 3.5) return '#EAB308'
    return '#EF4444'
  }
  return '#EAB308'
}

function GlassSection({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs uppercase tracking-widest mb-2 px-1" style={{ color: 'rgba(0,0,0,0.32)' }}>
        {title}
      </p>
      <div className="rounded-2xl overflow-hidden" style={card}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, last }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 ${!last ? 'border-b' : ''}`}
      style={{ borderColor: 'rgba(0,0,0,0.06)' }}
    >
      <p className="text-sm" style={{ color: 'rgba(0,0,0,0.75)' }}>{label}</p>
      <p className="text-sm" style={{ color: 'rgba(0,0,0,0.38)' }}>{value}</p>
    </div>
  )
}

function MetricRow({ label, value, unit, color, last }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 ${!last ? 'border-b' : ''}`}
      style={{ borderColor: 'rgba(0,0,0,0.06)' }}
    >
      <p className="text-sm" style={{ color: 'rgba(0,0,0,0.75)' }}>{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <p className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>{value} <span style={{ color: 'rgba(0,0,0,0.35)', fontWeight: 400 }}>{unit}</span></p>
      </div>
    </div>
  )
}

export default function ProfilePage({ data }) {
  const m = data?.metrics

  return (
    <div className="px-5 pt-14 pb-4">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#0A0A0A' }}>Account</h1>
      </div>

      {/* Avatar + Identity */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: '#1A1A1A', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
          >
            I
          </div>
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: '#34D399', borderColor: '#F2F1EE' }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: '#0A0A0A' }}>User</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.38)' }}>KBTU | Diploma Project 2026</p>
        </div>
      </div>

      {/* Current Biomarkers */}
      {m && (
        <GlassSection title="Latest Biomarkers">
          <MetricRow label="HRV (RMSSD)" value={m.hrv} unit="ms"
            color={statusColor(m.hrv, 'hrv')} />
          <MetricRow label="Wrist Temperature" value={m.temperature_diff > 0 ? '+' + m.temperature_diff : m.temperature_diff} unit="°C"
            color={'#EAB308'} />
          <MetricRow label="Breathing Rate" value={m.breathing_rate} unit="/min"
            color={statusColor(m.breathing_rate, 'breathing')} />
          <MetricRow label="LF/HF Ratio" value={m.lf_hf_ratio} unit=""
            color={statusColor(m.lf_hf_ratio, 'lf_hf')} />
          <Row label="Cycle Length" value="28 days" last />
        </GlassSection>
      )}

      {/* About */}
      <GlassSection title="About">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>KBTU Diploma Project</p>
            <span className="text-xs" style={{ color: 'rgba(0,0,0,0.22)' }}>v1.0.0</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.38)' }}>
            Analysis of correlation of non-invasive biomarkers based on deep learning for monitoring cyclic changes of steroid hormones.
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(0,0,0,0.20)' }}>Ibrahim Tlektes | 2026</p>
        </div>
      </GlassSection>

    </div>
  )
}
