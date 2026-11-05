'use client'

import { useState } from 'react'
import { ArrowRight, Bell, MessageSquareWarning, Sun, TrendingUp } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { numeric } from '@/components/heatguard/numeric-font'
import { ActionButton } from '@/components/heatguard/mobile-ui'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'

export function ReminderBox({ notice }: { notice?: string }) {
  return (
    <div className="rounded-2xl bg-white p-3.5">
      <p className="type-read">
        <span className="flex items-center gap-1.5">
          <Bell className="size-4 shrink-0 text-blue-600" aria-hidden />
          14:00
        </span>
        休憩時間です。水分を補給して定時チェックを行ってください。
      </p>
      {notice && <p className="type-caption mt-2 truncate">{notice}</p>}
    </div>
  )
}

export function WeatherCard() {
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="type-meta">現在の現場気象（大阪市北区）</p>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500 bg-white px-3 py-0.5 text-xs text-zinc-500">
          <span className="size-1.5 rounded-full bg-red-500" aria-hidden />
          WBGT 31.2℃
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="type-meta">現在の気温</span>
        <span className={`${numeric.className} text-[28px] leading-none tracking-[0.005em] text-ink`}>33.5℃</span>
      </p>
      <p className="type-body mt-3 flex items-start gap-1.5 rounded-lg bg-canvas px-3 py-2">
        <TrendingUp className="mt-0.5 size-4 shrink-0" aria-hidden />
        14時台にかけて 36.0℃ まで上昇予想（15分ごとの水分補給を推奨）
      </p>
    </div>
  )
}

const FORECAST = [
  { label: 'いま', temp: 33.5, dot: 'bg-amber-200' },
  { label: '1時間後', temp: 35, dot: 'bg-gradient-to-r from-amber-200 to-rose-300' },
  { label: '2時間後', temp: 36, dot: 'bg-gradient-to-r from-rose-300 to-purple-300' },
] as const

type WorkerHomeScreenProps = {
  onStartCheck: () => void
  morningResult?: '良好' | '要注意'
  notice?: string
  company?: string
  role?: string
  name?: string
  label?: string
  time?: string
  counts?: { good: number; bad: number }
  teamsPush?: { title: string; body: string }
}

export function WorkerHomeScreen({
  onStartCheck,
  notice,
  company,
  role,
  name,
  label = 'W-04 作業員・職長 共通ホーム画面',
  time = '14:00',
  counts,
  teamsPush,
}: WorkerHomeScreenProps) {
  const [lang, setLang] = useState<Lang>('JP')

  return (
    <PhoneFrame label={label} time={time} frame="dark" className="bg-canvas text-ink">
      <WorkerHeader company={company} role={role} name={name} lang={lang} onLangChange={setLang} counts={counts} />

      <div className={cn(SCREEN_BODY, 'relative bg-canvas')}>
        {teamsPush && (
          <div
            role="status"
            className="absolute inset-x-3 top-2 z-20 rounded-2xl bg-white p-3 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.28)]"
          >
            <p className="type-label flex items-center gap-2">
              <MessageSquareWarning className="size-5 shrink-0 text-[#5B5FC7]" aria-hidden />
              {teamsPush.title}
            </p>
            <p className="type-body mt-1 pl-7">{teamsPush.body}</p>
          </div>
        )}
        <section className="rounded-2xl bg-white px-5 py-4">
          <p className="type-read min-h-[6.75rem]">
            <span className="flex items-center justify-center gap-1.5">
              <Bell className="size-4 shrink-0 text-blue-600" style={{ strokeWidth: 2.75 }} aria-hidden />
              14:00
            </span>
            休憩時間です。水分を補給して定時チェックを行ってください。
          </p>
          {notice && <p className="type-caption mt-2 truncate">{notice}</p>}
        </section>

        <section className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          <div className="flex -translate-y-1.5 flex-col items-center">
            <p className="type-meta translate-y-0.5">現在の気温</p>
            <p className={`${numeric.className} mt-1 text-[4.75rem] leading-none tracking-[0.005em] text-ink`}>
              33<span className="text-[70%]">.5</span>
              <span className="relative inline-block text-[2rem]">
                <Sun className="absolute bottom-full left-1/2 mb-0.5 size-4 -translate-x-1/2 text-amber-400" aria-hidden />
                ℃
              </span>
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-500 bg-white px-4 py-1 text-xs text-zinc-500">
              <span className="size-1.5 rounded-full bg-red-500" aria-hidden />
              厳重警戒
            </p>
          </div>
          <div className="mt-8 flex w-full flex-col items-center">
            <p className="type-label">今後1時間で35℃まで上昇します</p>
            <div className="relative mt-4 w-full max-w-[280px]">
              <div className="absolute top-[7px] right-[16%] left-[16%] h-px bg-zinc-200" aria-hidden />
              <ol className="relative grid grid-cols-3" aria-label="いまから2時間後までの気温">
                {FORECAST.map((point, index) => (
                  <li key={point.label} aria-label={point.label} className="flex flex-col items-center">
                    <span className="relative flex size-3.5 items-center justify-center">
                      {index === 0 && (
                        <span className="now-glow absolute size-[22.4px] rounded-full bg-amber-300 blur-[1px]" aria-hidden />
                      )}
                      <span className={`relative size-[9.8px] rounded-full ring-[2.8px] ring-canvas ${point.dot}`} />
                    </span>
                    <span className={`${numeric.className} mt-3 text-sm text-ink`}>{point.temp.toFixed(1)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <div className="mt-auto">
          <ActionButton onClick={onStartCheck} icon={ArrowRight} className="mx-auto h-[42px] w-3/4">
            定時チェックへ進む
          </ActionButton>
        </div>
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
