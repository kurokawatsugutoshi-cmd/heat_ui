import { BatteryFull, Lock, Signal, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

type PhoneFrameProps = {
  children: React.ReactNode
  time?: string
  tone?: 'light' | 'alert'
  frame?: 'light' | 'dark'
  className?: string
  label: string
  overlay?: React.ReactNode
  highlighted?: boolean
}

export function PhoneFrame({ children, time = '7:45', tone = 'light', frame = 'light', className, label, overlay, highlighted }: PhoneFrameProps) {
  const dark = frame === 'dark'
  return (
    <figure
      aria-label={label}
      className={cn(
        'relative w-[375px] shrink-0 rounded-[2.5rem] border p-[9px] shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)] transition-shadow duration-300',
        dark ? 'border-black bg-black' : 'border-slate-300 bg-white',
        highlighted && 'ring-2 ring-blue-600 ring-offset-4 ring-offset-slate-50',
      )}
    >
      <div
        className={cn(
          'relative flex h-[780px] flex-col overflow-hidden rounded-[2rem] border transition-colors duration-500',
          dark ? 'border-black' : 'border-slate-200',
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

/** 横向き iPad Pro 13インチ（M5）。本体 281.6×215.5mm、画面 2752×2064。 */
export function IpadFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure
      aria-label={label}
      className="@container relative aspect-[2816/2155] w-full rounded-[2.25rem] bg-black p-[3%] shadow-[0_28px_56px_-28px_rgba(15,23,42,0.45)]"
    >
      <span
        className="absolute top-[1.5cqw] left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-800 ring-1 ring-zinc-700"
        aria-hidden
      />
      <div className="h-full overflow-hidden rounded-[1.35rem]">
        <div className="h-full overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </figure>
  )
}

export function BrowserFrame({ children, url, label }: { children: React.ReactNode; url: string; label: string }) {
  return (
    <figure
      aria-label={label}
      className="w-full overflow-hidden rounded-lg border border-line bg-canvas shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)]"
    >
      <div className="flex items-center border-b border-line bg-canvas px-4 py-2">
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1.5 rounded-md border border-line bg-white px-3 py-1 font-mono type-caption">
          <Lock className="size-3" aria-hidden />
          {url}
        </div>
      </div>
      <div className="relative bg-slate-50">{children}</div>
    </figure>
  )
}
