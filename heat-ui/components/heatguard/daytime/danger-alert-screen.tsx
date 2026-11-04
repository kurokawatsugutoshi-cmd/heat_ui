'use client'

import { useState } from 'react'
import { AlertTriangle, Droplets, HardHat, PhoneCall } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { ActionButton } from '@/components/heatguard/mobile-ui'
import { WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'

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
    <PhoneFrame label="W-05 日中危険アラート発令画面" time="14:25" className="bg-canvas text-ink" highlighted={highlighted}>
      <WorkerHeader company="〇〇鉄筋工業" name="グエン・ヴァン" lang={lang} onLangChange={setLang} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#DC2626] px-5 pt-5 pb-4">
        <section className="rounded-2xl bg-white px-4 py-4 text-ink">
          <h2 className="type-title flex items-center gap-2">
            <AlertTriangle className="size-6 shrink-0 text-red-600" aria-hidden />
            作業ストップ（危険アラート発令）
          </h2>
          <p className="mt-2 text-base leading-relaxed">14:25 定時報告で「異変あり（めまい）」を検知</p>
          {stage === 'resting' && (
            <p role="status" className="mt-2 flex items-center gap-1.5 text-base leading-relaxed">
              <span className="size-1.5 shrink-0 rounded-full bg-red-600" aria-hidden />
              休憩・経過観察中（上長へ通知済）
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white px-4 py-4 text-ink">
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
            <p className="text-base leading-relaxed">
              ひとりで立ち上がれるようになり、めまいやだるさが完全に消えてから作業に戻ってください。少しでも不安がある場合は上長へ連絡してください。
            </p>
          )}
        </section>

        <div className="mt-auto space-y-2.5">
          {stage === 'alert' ? (
            <>
              <ActionButton variant="alert-white" icon={Droplets} onClick={() => onStageChange('resting')}>
                水分を摂り、休憩に入りました
              </ActionButton>
            </>
          ) : (
            <>
              <ActionButton variant="alert-plain" icon={HardHat}>
                体調が回復したため作業に復帰する
              </ActionButton>
              <ActionButton variant="amber" icon={PhoneCall}>
                回復しないため上長・救護へ連絡する
              </ActionButton>
            </>
          )}
        </div>
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
