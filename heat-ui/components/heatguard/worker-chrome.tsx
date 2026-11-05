'use client'

import { ChevronDown, Frown, Globe, PhoneCall, Smile, type LucideIcon } from 'lucide-react'
import { LANGS, type Lang } from '@/components/showcase/phone-header'
import { cn } from '@/lib/utils'

/** W-04_2 基準。ヘッダー直下 16px、子要素間 20px、連続する section はさらに 10px（計 30px）。 */
export const SCREEN_BODY =
  'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pt-4 pb-5 [&>section+section]:mt-2.5'

type WorkerHeaderProps = {
  company?: string
  role?: string
  name?: string
  lang: Lang
  onLangChange: (lang: Lang) => void
  counts?: { good: number; bad: number }
}

function StatusBadge({ icon: Icon, count, tone, label }: { icon: LucideIcon; count: number; tone: 'good' | 'bad'; label: string }) {
  return (
    <span className="relative" aria-label={`${label} ${count}名`}>
      <Icon className="size-6 text-ink" aria-hidden />
      <span
        className={cn(
          'absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white',
          tone === 'good' ? 'bg-blue-600' : 'bg-red-600',
        )}
      >
        {count}
      </span>
    </span>
  )
}

export function WorkerHeader({
  company = '〇〇工務店',
  role = '作業員',
  name = '大和 太郎',
  lang,
  onLangChange,
  counts,
}: WorkerHeaderProps) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-canvas px-6 pt-3 pb-2">
      <div className="min-w-0">
        <p className="type-caption truncate">
          {company} / {role}
        </p>
        <p className="type-label mt-[3px] truncate">{name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 self-center">
        {counts && (
          <div className="flex items-center gap-3" aria-label="体調管理">
            <StatusBadge icon={Frown} count={counts.bad} tone="bad" label="要注意" />
            <StatusBadge icon={Smile} count={counts.good} tone="good" label="良好" />
          </div>
        )}
      <label className="relative flex items-center gap-1 rounded-full border border-zinc-200/80 bg-white px-[13px] py-1 text-xs text-zinc-500">
        <Globe className="size-3.5" aria-hidden />
        <span className="sr-only">表示言語</span>
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value as Lang)}
          className="cursor-pointer appearance-none bg-transparent pr-3.5 outline-none"
        >
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 size-3" aria-hidden />
      </label>
      </div>
    </header>
  )
}

export function WorkerFooter({ label = '緊急連絡' }: { label?: string }) {
  return (
    <a
      href="tel:0000000000"
      onClick={(e) => e.preventDefault()}
      className="flex h-14 w-full shrink-0 items-center justify-center gap-2 bg-sub text-sm font-medium text-sub-ink transition-colors hover:bg-blue-200 active:bg-blue-200"
    >
      <PhoneCall className="size-4" aria-hidden />
      {label}
    </a>
  )
}
