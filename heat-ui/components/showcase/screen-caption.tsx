type ScreenCaptionProps = {
  id: string
  title: string
}

export function ScreenCaption({ id, title }: ScreenCaptionProps) {
  return (
    <figcaption className="mb-4 flex w-[375px] items-center gap-2.5">
      <span className="shrink-0 whitespace-nowrap rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">{id}</span>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
    </figcaption>
  )
}

export function ScreenColumn({
  children,
  footer,
  ...caption
}: ScreenCaptionProps & { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col">
      <ScreenCaption {...caption} />
      {children}
      {footer && <div className="mt-4 w-[375px]">{footer}</div>}
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
