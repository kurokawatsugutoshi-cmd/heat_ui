'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useFlash<T extends string>(duration = 1600) {
  const [target, setTarget] = useState<T | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flash = useCallback(
    (next: T) => {
      if (timer.current) clearTimeout(timer.current)
      setTarget(next)
      timer.current = setTimeout(() => setTarget(null), duration)
    },
    [duration],
  )

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return [target, flash] as const
}
