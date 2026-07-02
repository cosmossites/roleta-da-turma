import type { CSSProperties } from 'react'

interface ConfettiBurstProps {
  active: boolean
}

const colors = ['#0f766e', '#14b8a6', '#f59e0b', '#be123c', '#4338ca']

export const ConfettiBurst = ({ active }: ConfettiBurstProps) => {
  if (!active) {
    return null
  }

  const pieces = Array.from({ length: 42 }, (_, index) => ({
    id: index,
    left: 8 + Math.random() * 84,
    delay: Math.random() * 280,
    color: colors[index % colors.length],
  }))

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          className="confetti-piece"
          key={piece.id}
          style={
            {
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}ms`,
              '--piece-color': piece.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
