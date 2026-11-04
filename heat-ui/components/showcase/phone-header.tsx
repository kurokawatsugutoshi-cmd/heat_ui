'use client'

import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LANGS = ['JP', 'VI', 'EN', 'ZH', 'ID'] as const
export type Lang = (typeof LANGS)[number]

const LANG_NAMES: Record<Lang, string> = {
  JP: '日本語',
  VI: 'Tiếng Việt',
  EN: 'English',
  ZH: '中文',
  ID: 'Bahasa Indonesia',
}

type LangSelectProps = {
  value: Lang
  onChange: (lang: Lang) => void
  tone?: 'light' | 'alert'
  compact?: boolean
}

export function LangSelect({ value, onChange, tone = 'light', compact = false }: LangSelectProps) {
  return (
    <label
      className={cn(
        'relative flex shrink-0 items-center gap-1.5 rounded-md border py-1.5 pr-7 pl-2.5 text-sm font-medium',
        tone === 'light' ? 'border-slate-300 bg-white text-slate-700' : 'border-white/40 bg-white/10 text-white',
      )}
    >
      <Globe className="size-4" aria-hidden />
      <span className="sr-only">表示言語</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Lang)}
        className={cn('cursor-pointer appearance-none bg-transparent outline-none', compact ? 'w-7' : 'max-w-[92px]')}
      >
        {LANGS.map((l) => (
          <option key={l} value={l} className="text-slate-900">
            {compact ? l : `${l} | ${LANG_NAMES[l]}`}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 size-3.5" aria-hidden />
    </label>
  )
}

type PhoneHeaderProps = {
  company?: string
  name?: string
  lang: Lang
  onLangChange: (lang: Lang) => void
  tone?: 'light' | 'alert'
  compactLang?: boolean
}

export function PhoneHeader({
  company = '〇〇工務店',
  name = '大和 太郎',
  lang,
  onLangChange,
  tone = 'light',
  compactLang,
}: PhoneHeaderProps) {
  return (
    <header
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 border-b px-5 py-2.5',
        tone === 'light' ? 'border-slate-200 bg-white' : 'border-white/25',
      )}
    >
      <div className="min-w-0">
        <p className={cn('truncate text-sm', tone === 'light' ? 'text-slate-500' : 'text-white/85')}>{company}</p>
        <p className="truncate text-base font-bold leading-tight">{name}</p>
      </div>
      <LangSelect value={lang} onChange={onLangChange} tone={tone} compact={compactLang} />
    </header>
  )
}
