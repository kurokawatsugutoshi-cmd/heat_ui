'use client'

import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { numeric } from '@/components/heatguard/numeric-font'
import { ActionButton, MoodPicker, Toast, type Mood } from '@/components/heatguard/mobile-ui'
import { EntryBlockModal } from '@/components/heatguard/entry/entry-block-modal'
import { cn } from '@/lib/utils'

type Sleep = '7h' | '6h' | '5h'

const sleepOptions: { value: Sleep; figure: string; caption: string }[] = [
  { value: '7h', figure: '7', caption: '時間以上' },
  { value: '6h', figure: '6', caption: '時間' },
  { value: '5h', figure: '5', caption: '時間以下' },
]

export const BP_LIMIT = { sys: 180, dia: 110 }

export function entryFindings({ mood, sys, dia, sleep }: { mood: Mood; sys: number; dia: number; sleep: Sleep }) {
  const findings: string[] = []
  if (sys >= BP_LIMIT.sys || dia >= BP_LIMIT.dia) findings.push(`朝の血圧：${sys} / ${dia} mmHg（基準超過）`)
  if (mood === 'bad') findings.push('今日の体調：悪い')
  if (sleep === '5h') findings.push('昨日の睡眠：5時間以下（睡眠不足）')
  return findings
}

function StepButton({ label, onStep, children }: { label: string; onStep: () => void; children: React.ReactNode }) {
  const delay = useRef<number | null>(null)
  const repeat = useRef<number | null>(null)

  const clear = () => {
    if (delay.current) window.clearTimeout(delay.current)
    if (repeat.current) window.clearInterval(repeat.current)
    delay.current = null
    repeat.current = null
  }

  return (
    <button
      type="button"
      aria-label={label}
      className="flex aspect-square size-14 shrink-0 touch-manipulation items-center justify-center rounded-md bg-white p-0 text-ink select-none active:bg-black active:text-white"
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        onStep()
        clear()
        delay.current = window.setTimeout(() => {
          repeat.current = window.setInterval(onStep, 70)
        }, 380)
      }}
      onPointerUp={clear}
      onPointerCancel={clear}
      onLostPointerCapture={clear}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        onStep()
      }}
    >
      {children}
    </button>
  )
}

function Stepper({
  label,
  unit,
  value,
  min,
  max,
  onChange,
  over,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  over?: boolean
}) {
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  valueRef.current = value
  onChangeRef.current = onChange

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, valueRef.current + delta))
    if (next === valueRef.current) return
    valueRef.current = next
    onChangeRef.current(next)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="type-body w-16 shrink-0 leading-tight">{label}</span>
      <div
        className={cn(
          'flex h-14 min-w-0 flex-1 items-center justify-end gap-1 rounded-md bg-white pr-3',
          over && 'ring-1 ring-amber-400 ring-inset',
        )}
      >
        <span
          className={cn(
            numeric.className,
            'text-[1.75rem] leading-none tracking-[0.005em]',
            over ? 'text-amber-700' : 'text-ink',
          )}
        >
          {value}
        </span>
        <span className="type-caption w-9 shrink-0 leading-none">{unit}</span>
      </div>
      <StepButton label={`${label}を1上げる`} onStep={() => step(1)}>
        <ChevronUp className="size-6" aria-hidden />
      </StepButton>
      <StepButton label={`${label}を1下げる`} onStep={() => step(-1)}>
        <ChevronDown className="size-6" aria-hidden />
      </StepButton>
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
      frame="dark"
      className="bg-canvas text-ink"
      highlighted={highlighted}
      overlay={
        <>
          {blockedFindings && <EntryBlockModal findings={blockedFindings} onResolve={enter} />}
          {entered && <Toast>入場受付完了</Toast>}
        </>
      }
    >
      <WorkerHeader lang={lang} onLangChange={setLang} />
      <div className={cn(SCREEN_BODY, 'bg-canvas')}>
        <h2 className="type-title flex items-baseline gap-2">
          朝の体調チェック
          <span className="type-meta font-normal">10/31 (土)</span>
        </h2>

        <section>
          <p className="type-label mb-2">今日の体調を入力</p>
          <MoodPicker
            size="lg"
            legend="今日の体調を入力"
            value={mood}
            onChange={setMood}
            labels={{ good: { title: '良い' }, normal: { title: '普通' }, bad: { title: '悪い' } }}
          />
        </section>

        <section>
          <p className="type-label mb-2">血圧・脈拍を入力</p>
          <div className="space-y-2">
            <Stepper label="最高血圧" unit="mmHg" value={sys} min={70} max={250} onChange={setSys} over={sys >= BP_LIMIT.sys} />
            <Stepper label="最低血圧" unit="mmHg" value={dia} min={40} max={150} onChange={setDia} over={dia >= BP_LIMIT.dia} />
            <Stepper label="脈拍" unit="bpm" value={pulse} min={30} max={200} onChange={setPulse} />
          </div>
        </section>

        <section>
          <p className="type-label mb-2">睡眠時間を入力</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="睡眠時間を入力">
            {sleepOptions.map((o) => {
              const selected = sleep === o.value
              return (
                <div key={o.value} className="@container">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSleep(o.value)}
                    className={cn(
                      'flex h-[calc(100cqw-6px)] w-full flex-col items-center justify-center rounded-md bg-white px-1 text-ink active:bg-blue-600 active:text-white',
                      selected && 'bg-blue-600 text-white',
                    )}
                  >
                    <span className={`${numeric.className} text-[2.5rem] leading-none tracking-[0.005em]`}>{o.figure}</span>
                    <span className="mt-1 text-xs leading-none">{o.caption}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <div className="mt-auto pt-1">
          <ActionButton onClick={submit}>入力完了する</ActionButton>
        </div>
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
