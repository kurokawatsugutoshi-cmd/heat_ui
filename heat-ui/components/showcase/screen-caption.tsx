'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type ScreenCaptionProps = {
  id: string
  title: string
}

export const SCREEN_GRID = 'grid grid-cols-3 items-start gap-6'

const PHONE_W = 375
const PHONE_H = 798

export function ScreenCaption({ id, title }: ScreenCaptionProps) {
  return (
    <figcaption className="mb-4 flex w-full items-center gap-2.5">
      <span className="shrink-0 whitespace-nowrap rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">{id}</span>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
    </figcaption>
  )
}

export function ScreenColumn({
  children,
  footer,
  ...caption
}: ScreenCaptionProps & { children: ReactNode; footer?: ReactNode }) {
  const slot = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = slot.current
    if (!el) return
    const update = () => setScale(el.clientWidth / PHONE_W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="flex min-w-0 flex-col">
      <ScreenCaption {...caption} />
      <div ref={slot} className="min-w-0">
        <div className="relative overflow-hidden" style={{ height: PHONE_H * scale }}>
          <div className="origin-top-left" style={{ width: PHONE_W, transform: `scale(${scale})` }}>
            {children}
          </div>
        </div>
      </div>
      {footer && <div className="mt-4 w-full">{footer}</div>}
    </div>
  )
}

type DemoTab<T extends string> = { value: T; label: string }

export function DemoTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
}: {
  label: string
  tabs: DemoTab<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2">
      <p className="mb-1.5 px-1 text-xs text-slate-500">{label}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={value === t.value}
            onClick={() => onChange(t.value)}
            className={
              value === t.value
                ? 'flex-1 rounded-md border border-blue-600 bg-blue-50 px-2 py-1.5 text-sm font-semibold text-blue-700'
                : 'flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50'
            }
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
