import { BatteryFull, Lock, Signal, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

type PhoneFrameProps = {
  children: React.ReactNode
  time?: string
  tone?: 'light' | 'alert'
  className?: string
  label: string
  overlay?: React.ReactNode
  highlighted?: boolean
}

export function PhoneFrame({ children, time = '7:45', tone = 'light', className, label, overlay, highlighted }: PhoneFrameProps) {
  return (
    <figure
      aria-label={label}
      className={cn(
        'relative w-[375px] shrink-0 rounded-[2.5rem] border border-slate-300 bg-white p-[9px] shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)] transition-shadow duration-300',
        highlighted && 'ring-2 ring-blue-600 ring-offset-4 ring-offset-slate-50',
      )}
    >
      <div
        className={cn(
          'relative flex h-[780px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 transition-colors duration-500',
          tone === 'light' ? 'bg-slate-50 text-slate-900' : 'border-red-700 bg-[#DC2626] text-white',
          className,
        )}
      >
        <div className="relative z-20 flex shrink-0 items-center justify-between px-7 pt-3 pb-1.5 text-xs font-semibold">
          <span className="font-mono">{time}</span>
          <span className="flex items-center gap-1" aria-hidden>
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        {overlay}
      </div>
    </figure>
  )
}

export function BrowserFrame({ children, url, label }: { children: React.ReactNode; url: string; label: string }) {
  return (
    <figure
      aria-label={label}
      className="w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)]"
    >
      <div className="flex items-center border-b border-slate-200 bg-slate-100 px-4 py-2">
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-500">
          <Lock className="size-3" aria-hidden />
          {url}
        </div>
      </div>
      <div className="relative bg-slate-50">{children}</div>
    </figure>
  )
}
