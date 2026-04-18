const ORANGE = '#0A0A0A'
const INACTIVE = 'rgba(0,0,0,0.28)'

function InsightIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.5 8.5L20 7L16 12L22 12L16 14L20 19L13.5 17.5L12 24L10.5 17.5L4 19L8 14L2 12L8 11L4 7L10.5 8.5Z"
        fill={active ? ORANGE : 'none'}
        stroke={active ? ORANGE : INACTIVE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <polyline
        points="22,12 18,12 15,21 9,3 6,12 2,12"
        stroke={active ? ORANGE : INACTIVE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={active ? ORANGE : INACTIVE} strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? ORANGE : INACTIVE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const TABS = [
  { id: 'insight', label: 'Insight',     Icon: InsightIcon },
  { id: 'metrics', label: 'Bio-Metrics', Icon: MetricsIcon },
  { id: 'profile', label: 'Account',     Icon: ProfileIcon },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-6 pt-2 z-50">
      <nav className="glass-tab rounded-2xl px-2 py-2 flex justify-around items-center">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200"
              style={{ background: active ? 'rgba(0,0,0,0.06)' : 'transparent' }}
            >
              <Icon active={active} />
              <span
                className="text-[10px] font-semibold tracking-wide transition-colors"
                style={{ color: active ? ORANGE : INACTIVE }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
