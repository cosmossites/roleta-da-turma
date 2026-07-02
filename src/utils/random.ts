export const secureRandomInt = (maxExclusive: number) => {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('O limite do sorteio precisa ser um número positivo.')
  }

  const cryptoSource = globalThis.crypto
  if (cryptoSource?.getRandomValues) {
    const maxUint = 0xffffffff
    const limit = maxUint - (maxUint % maxExclusive)
    const buffer = new Uint32Array(1)

    do {
      cryptoSource.getRandomValues(buffer)
    } while (buffer[0] >= limit)

    return buffer[0] % maxExclusive
  }

  return Math.floor(Math.random() * maxExclusive)
}

export const normalizeModulo = (value: number, modulo = 360) => {
  return ((value % modulo) + modulo) % modulo
}

export const computeTargetRotation = (
  currentRotation: number,
  itemCount: number,
  targetIndex: number,
  extraSpins = 6,
) => {
  const segmentAngle = 360 / itemCount
  const itemCenterAngle = targetIndex * segmentAngle + segmentAngle / 2
  const targetModulo = normalizeModulo(360 - itemCenterAngle)
  const currentModulo = normalizeModulo(currentRotation)
  const delta = normalizeModulo(targetModulo - currentModulo)

  return currentRotation + extraSpins * 360 + delta
}
