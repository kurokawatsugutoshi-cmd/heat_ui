'use client'

import { useState } from 'react'
import { Droplets, Hand, Pill, type LucideIcon } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { ActionButton, MoodPicker, Toast, type Mood } from '@/components/heatguard/mobile-ui'
import { WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'

export type CheckResult = 'ok' | 'caution' | 'danger'

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
    <PhoneFrame label="W-04_2 日中の定時チェック画面" time="14:02" className="bg-canvas text-ink" highlighted={highlighted} overlay={sent ? <Toast>送信しました</Toast> : undefined}>
      <WorkerHeader lang={lang} onLangChange={setLang} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-canvas px-5 pt-4 pb-5 [&>section+section]:mt-2.5">
        <h2 className="type-title">定時チェック（14:00 休憩枠）</h2>

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
          <p className="type-label mb-2">脱水の有無を入力</p>
          <p className="type-body flex items-start gap-2 rounded-2xl bg-white p-3">
            <Hand className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden />
            爪先を3秒押して赤みがすぐ戻るか、手の甲の皮膚をつまんで戻るか確認してください。
          </p>
          <button
            type="button"
            aria-pressed={dehydrated}
            onClick={() => setDehydrated((v) => !v)}
            className={cn(
              'type-body mt-2 flex w-full items-center rounded-md bg-white px-3 py-3 text-left leading-relaxed text-ink transition-colors active:bg-blue-600 active:text-white',
              dehydrated && 'bg-blue-600 text-white',
            )}
          >
            戻りが遅い・脱水の疑いがある場合は<span className="whitespace-nowrap">チェック</span>
          </button>
        </section>

        <div className="mt-auto pt-1">
          <ActionButton onClick={submit}>確認して送信する</ActionButton>
        </div>
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
