'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { ActionButton } from '@/components/heatguard/mobile-ui'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'

export type AlertStage = 'alert' | 'resting'

const FIRST_AID_STEPS = [
  '作業を止め、近くの日陰・クールスポットへ移動する',
  '衣服を緩め、首・脇の下・足の付け根を冷却する',
  '水分・塩分を摂取し、横になって休む',
]

type DangerAlertScreenProps = {
  stage: AlertStage
  onStageChange: (stage: AlertStage) => void
  highlighted?: boolean
}

export function DangerAlertScreen({ stage, onStageChange, highlighted }: DangerAlertScreenProps) {
  const [lang, setLang] = useState<Lang>('JP')

  return (
    <PhoneFrame label="W-05 日中危険アラート発令画面" time="14:25" frame="dark" className="bg-canvas text-ink" highlighted={highlighted}>
      <WorkerHeader lang={lang} onLangChange={setLang} />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div
          aria-hidden
          className="alert-wash pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-red-600/70 via-red-500/22 to-transparent"
        />
        <div className={cn(SCREEN_BODY, 'relative z-10')}>
        <section className="relative overflow-hidden rounded-2xl px-4 py-4 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-600 via-red-500 to-red-400"
          />
          <div className="relative">
            <h2 className="type-title flex items-center gap-2 text-white">
              <AlertTriangle className="size-6 shrink-0 text-white" aria-hidden />
              作業ストップ（危険アラート発令）
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/95">14:25 定時報告で「異変あり（めまい）」を検知</p>
            {stage === 'resting' && (
              <p role="status" className="mt-2 flex items-center gap-1.5 text-base leading-relaxed text-white/95">
                <span className="size-1.5 shrink-0 rounded-full bg-white" aria-hidden />
                休憩・経過観察中（上長へ通知済）
              </p>
            )}
          </div>
        </section>

        <section>
          <p className="type-label mb-2">改善フロー</p>
          <div className="overflow-hidden rounded-2xl bg-white px-4 py-4 text-ink">
            {stage === 'alert' ? (
              <>
                <p className="text-base font-bold leading-relaxed text-red-600">直ちに作業を中断してください</p>
                <ol className="mt-3 space-y-3">
                  {FIRST_AID_STEPS.map((step, i) => (
                    <li key={step} className="flex gap-2.5 text-base leading-relaxed">
                      <span className="w-4 shrink-0 font-bold text-red-600">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <>
                <p className="text-base font-bold leading-relaxed text-red-600">改善がみられましたか？</p>
                <p className="mt-3 text-base leading-relaxed">
                  ひとりで立ち上がれるようになり、めまいやだるさが完全に消えてから作業に戻ってください。
                </p>
                <p className="mt-3 text-base leading-relaxed">少しでも不安がある場合は上長へ連絡してください。</p>
              </>
            )}
          </div>
        </section>

        <div className="mt-auto space-y-2.5">
          {stage === 'alert' ? (
            <ActionButton variant="danger" onClick={() => onStageChange('resting')}>
              水分を摂り、休憩に入りました
            </ActionButton>
          ) : (
            <>
              <ActionButton variant="primary">体調が回復したため作業に復帰する</ActionButton>
              <ActionButton variant="danger">回復しないため上長・救護へ連絡する</ActionButton>
            </>
          )}
        </div>
        </div>
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
