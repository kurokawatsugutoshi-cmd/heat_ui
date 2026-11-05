'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, Droplets, Pill, type LucideIcon } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { ActionButton, MoodPicker, Toast, type Mood } from '@/components/heatguard/mobile-ui'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'

export type CheckResult = 'ok' | 'caution' | 'danger'

const DEHYDRATE_SLIDES = [
  {
    text: '爪先を3秒押して赤みがすぐ戻るか、手の甲の皮膚をつまんで戻るか確認してください。',
  },
  {
    text: '手の甲の皮膚をつまんで、すぐ戻るか確認してください。',
  },
]

function DehydrateCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'flex min-h-9 w-full items-start gap-2.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium leading-snug text-slate-700 transition-colors hover:bg-slate-50',
        checked && 'bg-slate-50',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border',
          checked ? 'border-slate-700 bg-slate-700 text-white' : 'border-slate-400 bg-white',
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      戻りが遅い・脱水の疑いがある場合はチェック
    </button>
  )
}

function SupplyTile({ pressed, onToggle, icon: Icon, label }: { pressed: boolean; onToggle: () => void; icon: LucideIcon; label: string }) {
  return (
    <div className="@container">
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onToggle}
        className={cn(
          'flex h-[calc(100cqw-6px)] w-full flex-col items-center justify-center rounded-md bg-white px-2 text-ink transition-colors active:bg-blue-600 active:text-white',
          pressed && 'bg-blue-600 text-white',
        )}
      >
        <Icon className="size-11" aria-hidden />
        <span className="mt-2 text-sm font-semibold leading-none">{label}</span>
      </button>
    </div>
  )
}

export function HourlyCheckScreen({ onSubmit, highlighted }: { onSubmit: (result: CheckResult) => void; highlighted?: boolean }) {
  const [lang, setLang] = useState<Lang>('JP')
  const [water, setWater] = useState(false)
  const [salt, setSalt] = useState(false)
  const [mood, setMood] = useState<Mood>('good')
  const [dehydrated, setDehydrated] = useState(false)
  const [dehydrateOpen, setDehydrateOpen] = useState(true)
  const [dehydrateSlide, setDehydrateSlide] = useState(0)
  const [sent, setSent] = useState(false)

  const submit = () => {
    const result: CheckResult = mood === 'bad' ? 'danger' : mood === 'normal' || dehydrated ? 'caution' : 'ok'
    onSubmit(result)
    if (result !== 'danger') {
      setSent(true)
      setTimeout(() => setSent(false), 2000)
    }
  }

  return (
    <PhoneFrame label="W-04_2 日中の定時チェック画面" time="14:02" frame="dark" className="bg-canvas text-ink" highlighted={highlighted} overlay={sent ? <Toast>送信しました</Toast> : undefined}>
      <WorkerHeader lang={lang} onLangChange={setLang} />
      <div className={cn(SCREEN_BODY, 'bg-canvas')}>
        <h2 className="type-title flex items-center gap-2">
          定時チェック
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-ink">14:00 休憩時</span>
        </h2>

        <section>
          <p className="type-label mb-2">水分・塩分を入力</p>
          <div className="grid grid-cols-2 gap-2">
            <SupplyTile pressed={water} onToggle={() => setWater(!water)} icon={Droplets} label="水分をとった" />
            <SupplyTile pressed={salt} onToggle={() => setSalt(!salt)} icon={Pill} label="塩分をとった" />
          </div>
        </section>

        <section>
          <p className="type-label mb-2">今の体調を入力</p>
          <MoodPicker
            size="lg"
            legend="今の体調を入力"
            value={mood}
            onChange={setMood}
            labels={{
              good: { title: '元気', sub: '変化なし' },
              normal: { title: '少しだるい', sub: 'バテ気味' },
              bad: { title: '異変あり', sub: 'めまい・吐き気等' },
            }}
          />
        </section>

        <section>
          <button
            type="button"
            aria-expanded={dehydrateOpen}
            aria-controls="dehydrate-panel"
            onClick={() => setDehydrateOpen((v) => !v)}
            className="type-label flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="flex min-w-0 items-center gap-2">
              脱水の有無を入力
              {dehydrated && !dehydrateOpen && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">疑いあり</span>
              )}
            </span>
            <ChevronDown className={cn('size-4 shrink-0 text-quiet transition-transform', dehydrateOpen && 'rotate-180')} aria-hidden />
          </button>
          {dehydrateOpen && (
            <div id="dehydrate-panel" className="relative mt-2 overflow-hidden rounded-2xl bg-white">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${dehydrateSlide * 100}%)` }}
              >
                {DEHYDRATE_SLIDES.map((item) => (
                  <div key={item.text} className="w-full shrink-0">
                    <p className="px-3 pt-3 text-sm leading-relaxed text-ink">{item.text}</p>
                    <img src="/dehydrate-check.jpg?v=2" alt="" className="w-full object-contain" />
                    <div className="px-3 pb-3">
                      <DehydrateCheckbox checked={dehydrated} onToggle={() => setDehydrated((v) => !v)} />
                    </div>
                  </div>
                ))}
              </div>
              {dehydrateSlide < DEHYDRATE_SLIDES.length - 1 && (
                <button
                  type="button"
                  aria-label="次のチェックへ"
                  onClick={() => setDehydrateSlide((n) => n + 1)}
                  className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_1px_4px_rgba(15,23,42,0.18)]"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              )}
            </div>
          )}
        </section>

        <div className="mt-auto pt-1">
          <ActionButton onClick={submit}>確認して送信する</ActionButton>
        </div>
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
