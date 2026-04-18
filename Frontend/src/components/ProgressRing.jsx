export default function ProgressRing({ score = 78, size = 220 }) {
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const cx = size / 2
  const cy = size / 2

  const ringColor   = score >= 75 ? '#00D4A0' : score >= 55 ? '#EAB308' : score >= 35 ? '#EAB308' : '#EF4444'
  const glowColor   = 'transparent'
  const statusLabel = score >= 75 ? 'Good' : score >= 55 ? 'Moderate' : score >= 35 ? 'Low' : 'Critical'
  const statusColor = ringColor

  return (
    <div className="relative flex flex-col items-center">

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center select-none">
          <span className="text-5xl font-bold tracking-tight" style={{ color: '#0A0A0A' }}>{score}%</span>
          <span className="text-xs font-semibold mt-1 tracking-widest uppercase" style={{ color: statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
