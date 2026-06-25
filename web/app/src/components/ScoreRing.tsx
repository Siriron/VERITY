import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number      // 0–100
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  animate?: boolean
}

export default function ScoreRing({
  score,
  size = 72,
  strokeWidth = 6,
  color = '#1e56a0',
  label,
  animate = true,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference

  useEffect(() => {
    if (!animate) return
    const start = Date.now()
    const duration = 900
    const raf = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(ease * score))
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [score, animate])

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ddd8ce"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: size * 0.22, fontWeight: 500, color: '#1c1a17' }}
        >
          {displayed}
        </div>
      </div>
      {label && (
        <span className="text-xs text-sand-400 font-body uppercase tracking-wide">{label}</span>
      )}
    </div>
  )
}
