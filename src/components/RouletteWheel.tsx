import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { THEME_COLORS } from '../data/defaults'
import type { ParticipantOption, ThemeKey } from '../types'

interface RouletteWheelProps {
  participants: ParticipantOption[]
  rotation: number
  durationMs: number
  spinning: boolean
  highlightedId?: string
  theme: ThemeKey
  showLabels: boolean
}

const polarToCartesian = (center: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180

  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  }
}

const describeSlice = (startAngle: number, endAngle: number) => {
  const center = 250
  const radius = 242
  const start = polarToCartesian(center, radius, endAngle)
  const end = polarToCartesian(center, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

const readableFill = (index: number, primary: string, secondary: string) => {
  const palette = [primary, secondary, '#ffc400', '#003a8c', '#1789ff', '#ffdf45']
  return palette[index % palette.length]
}

const readableText = (fill: string) => {
  return fill === '#ffc400' || fill === '#ffdf45' || fill.startsWith('#f')
    ? '#08306f'
    : '#ffffff'
}

export const RouletteWheel = ({
  participants,
  rotation,
  durationMs,
  spinning,
  highlightedId,
  theme,
  showLabels,
}: RouletteWheelProps) => {
  const colors = THEME_COLORS[theme]
  const count = Math.max(participants.length, 1)
  const segmentAngle = 360 / count
  const fontSize = Math.max(5, Math.min(18, 250 / count))
  const shouldRenderText = showLabels && count <= 140

  return (
    <div className="wheel-wrap" aria-label="Roleta visual">
      <div className="wheel-pointer" aria-hidden="true" />
      <motion.svg
        className="wheel-svg"
        viewBox="0 0 500 500"
        role="img"
        aria-label={`Roleta com ${participants.length} participantes`}
        animate={{ rotate: rotation }}
        transition={{
          duration: spinning ? durationMs / 1000 : 0,
          ease: [0.08, 0.7, 0.08, 1],
        }}
      >
        <defs>
          <radialGradient id="wheelDepth" cx="50%" cy="45%" r="58%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="66%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.07" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="248" fill="#ffffff" stroke="rgba(15,23,42,0.16)" strokeWidth="8" />
        {participants.map((participant, index) => {
          const start = index * segmentAngle
          const end = start + segmentAngle
          const mid = start + segmentAngle / 2
          const point = polarToCartesian(250, count > 45 ? 176 : 168, mid)
          const fill =
            participant.id === highlightedId ? '#ffc400' : readableFill(index, colors.primary, colors.secondary)
          const text = count > 60 && participant.label.length > 3 ? String(index + 1) : participant.shortLabel
          const rotate = mid > 90 && mid < 270 ? mid + 180 : mid

          return (
            <g key={participant.id}>
              <path d={describeSlice(start, end)} fill={fill} stroke="rgba(255,255,255,0.86)" strokeWidth="2" />
              {shouldRenderText ? (
                <text
                  x={point.x}
                  y={point.y}
                  fill={readableText(fill)}
                  fontSize={fontSize}
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${rotate} ${point.x} ${point.y})`}
                >
                  {text}
                </text>
              ) : null}
            </g>
          )
        })}
        <circle cx="250" cy="250" r="244" fill="url(#wheelDepth)" pointerEvents="none" />
      </motion.svg>
      <div className="wheel-center" aria-hidden="true">
        <Sparkles size={22} />
        <span>Sortear</span>
      </div>
    </div>
  )
}
