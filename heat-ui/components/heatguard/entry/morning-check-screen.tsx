'use client'

import { useState } from 'react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { PhoneHeader, type Lang } from '@/components/showcase/phone-header'
import { ActionButton, MoodPicker, SectionLabel, Toast, type Mood } from '@/components/heatguard/mobile-ui'
import { EntryBlockModal } from '@/components/heatguard/entry/entry-block-modal'
import { cn } from '@/lib/utils'

type Sleep = '7h' | '6h' | '5h'

const sleepOptions: { value: Sleep; label: string }[] = [
  { value: '7h', label: '7時間以上' },
  { value: '6h', label: '6時間' },
  { value: '5h', label: '5時間以下' },
]

export const BP_LIMIT = { sys: 180, dia: 110 }

export function entryFindings({ mood, sys, dia, sleep }: { mood: Mood; sys: number; dia: number; sleep: Sleep }) {
  const findings: string[] = []
  if (sys >= BP_LIMIT.sys || dia >= BP_LIMIT.dia) findings.push(`朝の血圧：${sys} / ${dia} mmHg（基準超過）`)
  if (mood === 'bad') findings.push('今日の体調：悪い')
  if (sleep === '5h') findings.push('昨日の睡眠：5時間以下（睡眠不足）')
  return findings
}

function Stepper({
  label,
  unit,
  value,
  onChange,
  over,
}: {
  label: string
  unit: string
  value: number
  onChange: (v: number) => void
  over?: boolean
}) {
  const stepClass =
    'flex h-11 w-14 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50'
  return (
    <div className="flex items-center gap-2">
      <span className="w-[4.5rem] shrink-0 text-sm text-slate-600">{label}</span>
      <button type="button" onClick={() => onChange(value - 10)} className={stepClass} aria-label={`${label}を10下げる`}>
        -10
      </button>
      <span
        className={cn(
          'flex h-11 flex-1 items-baseline justify-center gap-1 rounded-md border bg-white pt-2 tabular-nums',
          over ? 'border-amber-500 text-amber-700' : 'border-slate-200 text-slate-900',
        )}
      >
        <span className="text-xl font-semibold">{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </span>
      <button type="button" onClick={() => onChange(value + 10)} className={stepClass} aria-label={`${label}を10上げる`}>
        +10
      </button>
    </div>
  )
}

export function MorningCheckScreen({ onEntered, highlighted }: { onEntered?: () => void; highlighted?: boolean }) {
  const [lang, setLang] = useState<Lang>('JP')
  const [mood, setMood] = useState<Mood>('good')
  const [sys, setSys] = useState(120)
  const [dia, setDia] = useState(80)
  const [pulse, setPulse] = useState(70)
  const [sleep, setSleep] = useState<Sleep>('7h')
  const [blockedFindings, setBlockedFindings] = useState<string[] | null>(null)
  const [entered, setEntered] = useState(false)

  const enter = () => {
    setBlockedFindings(null)
    setEntered(true)
    setTimeout(() => {
      setEntered(false)
      onEntered?.()
    }, 1500)
  }

  const submit = () => {
    const blocked = mood === 'bad' || sys >= BP_LIMIT.sys || dia >= BP_LIMIT.dia
    if (blocked) setBlockedFindings(entryFindings({ mood, sys, dia, sleep }))
    else enter()
  }

  return (
    <PhoneFrame
      label="W-02 朝の体調・バイタルチェック画面"
      time="7:45"
      highlighted={highlighted}
      overlay={
        <>
          {blockedFindings && <EntryBlockModal findings={blockedFindings} onResolve={enter} />}
          {entered && <Toast>入場受付完了</Toast>}
        </>
      }
    >
      <PhoneHeader lang={lang} onLangChange={setLang} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-4">
        <h2 className="flex items-baseline gap-2 text-xl font-bold text-slate-900">
          朝の体調チェック
          <span className="text-sm font-normal text-slate-500">10/31 (土)</span>
        </h2>

        <section>
          <SectionLabel step="1">今日の体調</SectionLabel>
          <MoodPicker
            legend="今日の体調"
            value={mood}
            onChange={setMood}
            labels={{ good: { title: '良い' }, normal: { title: '普通' }, bad: { title: '悪い' } }}
          />
        </section>

        <section>
          <SectionLabel step="2" hint="血圧計の数値を入力">
            朝の血圧・脈拍
          </SectionLabel>
          <div className="space-y-2">
            <Stepper label="最高血圧" unit="mmHg" value={sys} onChange={setSys} over={sys >= BP_LIMIT.sys} />
            <Stepper label="最低血圧" unit="mmHg" value={dia} onChange={setDia} over={dia >= BP_LIMIT.dia} />
            <Stepper label="脈拍" unit="bpm" value={pulse} onChange={setPulse} />
          </div>
        </section>

        <section>
          <SectionLabel step="3">昨日の睡眠時間</SectionLabel>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="昨日の睡眠時間">
            {sleepOptions.map((o) => {
              const selected = sleep === o.value
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSleep(o.value)}
                  className={cn(
                    'h-11 rounded-md border-2 text-sm font-semibold transition-colors',
                    selected ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  )}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </section>

        <div className="mt-auto">
          <ActionButton onClick={submit}>入力完了（入場する）</ActionButton>
        </div>
      </div>
    </PhoneFrame>
  )
}
