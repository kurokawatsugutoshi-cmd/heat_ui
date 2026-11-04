'use client'

import { useState } from 'react'
import { ArrowRight, Bell, ChevronDown, Globe, PhoneCall, TrendingUp } from 'lucide-react'
import { Outfit } from 'next/font/google'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { LANGS, type Lang } from '@/components/showcase/phone-header'

const numeric = Outfit({
  subsets: ['latin'],
  weight: ['400'],
})

export function ReminderBox({ notice }: { notice?: string }) {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50/80 p-3.5">
      <p className="flex items-start gap-2 text-sm font-bold leading-relaxed text-slate-900">
        <Bell className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
        14:00 休憩時間です。水分を補給して定時チェックを行ってください。
      </p>
      {notice && <p className="mt-2 truncate border-t border-blue-200 pt-2 pl-6 text-sm text-slate-600">{notice}</p>}
    </div>
  )
}

export function WeatherCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-600">現在の現場気象（大阪市北区）</p>
        <span className="shrink-0 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
          WBGT 31.2℃｜厳重警戒
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-sm text-slate-600">現在の気温</span>
        <span className="text-[28px] font-bold leading-none text-slate-900 tabular-nums">33.5℃</span>
      </p>
      <p className="mt-3 flex items-start gap-1.5 rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">
        <TrendingUp className="mt-0.5 size-4 shrink-0" aria-hidden />
        14時台にかけて 36.0℃ まで上昇予想（15分ごとの水分補給を推奨）
      </p>
    </div>
  )
}

const FORECAST = [
  { label: 'いま', temp: 33.5 },
  { label: '1時間後', temp: 35 },
  { label: '2時間後', temp: 36 },
] as const

function forecastDot(temp: number) {
  if (temp >= 35) return 'bg-rose-300'
  if (temp >= 33) return 'bg-amber-200'
  return 'bg-sky-200'
}

type WorkerHomeScreenProps = {
  onStartCheck: () => void
  morningResult?: '良好' | '要注意'
  notice?: string
}

export function WorkerHomeScreen({ onStartCheck, notice }: WorkerHomeScreenProps) {
  const [lang, setLang] = useState<Lang>('JP')

  return (
    <PhoneFrame label="W-04 作業員・職長 共通ホーム画面" time="14:00" className="bg-white text-zinc-600">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e1e7ec] bg-[#f3f6f8] px-6 pt-3 pb-2">
        <div className="min-w-0">
          <p className="truncate text-xs text-zinc-400">〇〇工務店 / 作業員</p>
          <p className="mt-[3px] truncate text-sm font-bold text-zinc-700">大和 太郎</p>
        </div>
        <label className="relative flex shrink-0 -translate-y-[1.5px] items-center self-center gap-1 rounded-full border border-zinc-200/80 bg-white px-[13px] py-1 text-xs text-zinc-500">
          <Globe className="size-3.5" aria-hidden />
          <span className="sr-only">表示言語</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
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

      <div className="flex min-h-0 flex-1 flex-col bg-[#f3f6f8] px-6 pt-1 pb-4">
        <section className="mt-3 rounded-2xl bg-white px-5 py-4">
          <p className="min-h-[6.75rem] text-base font-bold leading-[27px] text-zinc-700">
            <span className="flex items-center justify-center gap-1.5">
              <Bell className="size-4 shrink-0 text-blue-600" aria-hidden />
              14:00
            </span>
            休憩時間です。水分を補給して定時チェックを行ってください。
          </p>
          {notice && <p className="mt-2 truncate text-xs text-zinc-400">{notice}</p>}
        </section>

        <section className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          <div className="flex -translate-y-1.5 flex-col items-center">
            <p className="translate-y-0.5 text-sm text-zinc-400">現在の気温</p>
            <p className={`${numeric.className} mt-1 text-[4.75rem] leading-none tracking-tight text-zinc-700`}>
              33<span className="text-[70%]">.5</span>
              <span className="text-[2rem]">℃</span>
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-500 bg-white px-4 py-1 text-xs text-zinc-500">
              <span className="size-1.5 rounded-full bg-red-500" aria-hidden />
              厳重警戒
            </p>
          </div>
          <div className="mt-8 flex w-full flex-col items-center">
            <p className="text-sm font-bold text-zinc-700">今後1時間で35℃まで上昇します</p>
            <div className="relative mt-4 w-full max-w-[280px]">
              <div className="absolute top-[7px] right-[16%] left-[16%] h-px bg-zinc-200" aria-hidden />
              <ol className="relative grid grid-cols-3" aria-label="いまから2時間後までの気温">
                {FORECAST.map((point, index) => (
                  <li key={point.label} aria-label={point.label} className="flex flex-col items-center">
                    <span className="relative flex size-3.5 items-center justify-center">
                      {index === 0 && (
                        <span className="now-glow absolute size-8 rounded-full bg-amber-300 blur-[1px]" aria-hidden />
                      )}
                      <span className={`relative size-3.5 rounded-full ring-4 ring-[#f3f6f8] ${forecastDot(point.temp)}`} />
                    </span>
                    <span className={`${numeric.className} mt-3 text-sm text-zinc-600`}>{point.temp.toFixed(1)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <div className="mt-auto">
          <button
            type="button"
            onClick={onStartCheck}
            className="mx-auto flex h-[42px] w-3/4 items-center justify-center gap-2 rounded-lg bg-blue-600 text-[15px] font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ArrowRight className="size-4" aria-hidden />
            定時チェックへ進む
          </button>
        </div>
      </div>
      <a
        href="tel:0000000000"
        onClick={(e) => e.preventDefault()}
        className="flex h-14 w-full shrink-0 items-center justify-center gap-2 bg-blue-100 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-200 active:bg-blue-200"
      >
        <PhoneCall className="size-4" aria-hidden />
        緊急連絡
      </a>
    </PhoneFrame>
  )
}
