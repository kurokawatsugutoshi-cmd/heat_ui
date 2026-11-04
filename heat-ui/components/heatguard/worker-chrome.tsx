'use client'

import { ChevronDown, Globe, PhoneCall } from 'lucide-react'
import { LANGS, type Lang } from '@/components/showcase/phone-header'

type WorkerHeaderProps = {
  company?: string
  role?: string
  name?: string
  lang: Lang
  onLangChange: (lang: Lang) => void
}

export function WorkerHeader({
  company = '〇〇工務店',
  role = '作業員',
  name = '大和 太郎',
  lang,
  onLangChange,
}: WorkerHeaderProps) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-canvas px-6 pt-3 pb-2">
      <div className="min-w-0">
        <p className="type-caption truncate">
          {company} / {role}
        </p>
        <p className="type-label mt-[3px] truncate">{name}</p>
      </div>
      <label className="relative flex shrink-0 -translate-y-[1.5px] items-center self-center gap-1 rounded-full border border-zinc-200/80 bg-white px-[13px] py-1 text-xs text-zinc-500">
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
    </header>
  )
}

export function WorkerFooter() {
  return (
    <a
      href="tel:0000000000"
      onClick={(e) => e.preventDefault()}
      className="flex h-14 w-full shrink-0 items-center justify-center gap-2 bg-sub text-sm font-medium text-sub-ink transition-colors hover:bg-blue-200 active:bg-blue-200"
    >
      <PhoneCall className="size-4" aria-hidden />
      緊急連絡
    </a>
  )
}
