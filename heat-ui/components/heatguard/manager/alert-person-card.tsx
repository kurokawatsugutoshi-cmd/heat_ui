import { type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertStatus = 'pending' | 'responding' | 'choosing'

type AlertPersonCardProps = {
  company: string
  lang?: string
  name: string
  step: AlertStatus
  done?: boolean
  responder?: string
  dot?: boolean | 'red' | 'blue'
  doneLabel?: string
  report?: string
  children?: ReactNode
}

function StatusBadge({ step, done, doneLabel }: { step: AlertStatus; done: boolean; doneLabel?: string }) {
  if (done)
    return (
      <span className="flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-medium text-ink">
        {!doneLabel && <Check className="size-3.5" aria-hidden />}
        {doneLabel ?? '対応記録完了'}
      </span>
    )
  if (step === 'pending')
    return (
      <span className="rounded-full border border-red-500 bg-white px-2.5 py-0.5 text-xs font-medium text-ink">
        未対応
      </span>
    )
  return (
    <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-medium text-ink">
      対応中
    </span>
  )
}

export function AlertPersonCard({
  company,
  lang = 'JP',
  name,
  step,
  done = false,
  responder,
  dot,
  doneLabel,
  report,
  children,
}: AlertPersonCardProps) {
  const assignee = responder ?? (step === 'pending' && !done ? 'ー' : '管理太郎')
  const showDot = Boolean(dot) || (dot === undefined && step === 'pending' && !done)
  const dotClass = dot === 'blue' ? 'bg-blue-600' : 'bg-red-600'

  return (
    <div
      className={cn(
        'rounded-2xl p-4 text-left',
        done && doneLabel ? 'bg-white/70 text-quiet opacity-60' : 'bg-white',
      )}
    >
      <p className="flex items-baseline justify-between gap-2">
        <span className="type-caption min-w-0 truncate">{company}</span>
        <span className="type-caption shrink-0">言語：{lang}</span>
      </p>
      <p className="type-title mt-0.5 flex items-center gap-2">
        {showDot && <span className={`size-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden />}
        {name}
      </p>
      {report && <p className="type-label mt-1">{report}</p>}
      <div className="mt-1.5 grid grid-cols-[auto_1fr] items-center justify-items-start gap-x-2 gap-y-1.5">
        <span className="type-caption">ステータス</span>
        <StatusBadge step={step} done={done} doneLabel={doneLabel} />
        <span className="type-caption">対応者</span>
        <span className="type-label">{assignee}</span>
      </div>
      {children}
    </div>
  )
}
