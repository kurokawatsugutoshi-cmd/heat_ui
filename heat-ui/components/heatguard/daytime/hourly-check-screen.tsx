'use client'

import { useState } from 'react'
import { Check, Droplets, Hand, Pill, type LucideIcon } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { PhoneHeader, type Lang } from '@/components/showcase/phone-header'
import { ActionButton, EmergencyButton, MoodPicker, SectionLabel, Toast, type Mood } from '@/components/heatguard/mobile-ui'
import { cn } from '@/lib/utils'

export type CheckResult = 'ok' | 'caution' | 'danger'

function SupplyTile({ pressed, onToggle, icon: Icon, label }: { pressed: boolean; onToggle: () => void; icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'relative flex flex-col items-center gap-1.5 rounded-md border py-3 transition-colors',
        pressed ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
      )}
    >
      {pressed && <Check className="absolute top-1.5 right-1.5 size-4" aria-hidden />}
      <Icon className="size-7" aria-hidden />
      <span className="text-sm font-semibold">{label}</span>
    </button>
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
    <PhoneFrame label="W-04_2 日中の定時チェック画面" time="14:02" highlighted={highlighted} overlay={sent ? <Toast>送信しました</Toast> : undefined}>
      <PhoneHeader lang={lang} onLangChange={setLang} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-4">
        <h2 className="text-xl font-bold text-slate-900">定時チェック（14:00 休憩枠）</h2>

        <section>
          <SectionLabel step="1" hint="補給したらタップ">
            水分・塩分の補給
          </SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <SupplyTile pressed={water} onToggle={() => setWater(!water)} icon={Droplets} label="水分をとった" />
            <SupplyTile pressed={salt} onToggle={() => setSalt(!salt)} icon={Pill} label="塩分をとった" />
          </div>
        </section>

        <section>
          <SectionLabel step="2">今の体調</SectionLabel>
          <MoodPicker
            legend="今の体調"
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
          <SectionLabel step="3" hint="確認ガイド">
            脱水セルフチェック
          </SectionLabel>
          <p className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50/60 p-3 text-sm leading-relaxed text-slate-700">
            <Hand className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden />
            爪先を3秒押して赤みがすぐ戻るか、手の甲の皮膚をつまんで戻るか確認してください。
          </p>
          <label className="mt-2 flex cursor-pointer items-start gap-2 px-1 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={dehydrated}
              onChange={(e) => setDehydrated(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded accent-blue-600"
            />
            戻りが遅い・脱水の疑いがある場合はチェック
          </label>
        </section>

        <div className="mt-auto space-y-2.5">
          <ActionButton onClick={submit}>確認して送信する</ActionButton>
          <EmergencyButton label="緊急連絡（工事課員へ直通）" />
        </div>
      </div>
    </PhoneFrame>
  )
}
