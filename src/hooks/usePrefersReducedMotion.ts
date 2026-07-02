import { useEffect, useState } from 'react'

export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(() =>
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  useEffect(() => {
    const media = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!media) {
      return undefined
    }

    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}
