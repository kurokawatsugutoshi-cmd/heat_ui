'use client'

import { useState } from 'react'
import { AlertOctagon, Droplets, HardHat, PhoneCall } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { PhoneHeader, type Lang } from '@/components/showcase/phone-header'
import { ActionButton } from '@/components/heatguard/mobile-ui'

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
    <PhoneFrame label="W-05 日中危険アラート発令画面" time="14:25" tone="alert" highlighted={highlighted}>
      <PhoneHeader company="〇〇鉄筋工業" name="グエン・ヴァン" lang={lang} onLangChange={setLang} tone="alert" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold leading-tight">
            <AlertOctagon className="size-6 shrink-0" aria-hidden />
            作業ストップ（危険アラート発令）
          </h2>
          <p className="mt-2 w-fit rounded bg-red-800/40 px-2.5 py-1 text-sm">14:25 定時報告で「異変あり（めまい）」を検知</p>
          {stage === 'resting' && (
            <p role="status" className="mt-2 w-fit rounded border border-white/60 bg-white px-2.5 py-1 text-sm font-semibold text-red-700">
              休憩・経過観察中（上長へ通知済）
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white p-4 text-slate-900">
          {stage === 'alert' ? (
            <>
              <p className="text-lg font-bold text-red-600">直ちに作業を中断してください</p>
              <ol className="mt-3 space-y-2.5">
                {FIRST_AID_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-xs font-semibold text-red-700">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="text-base font-semibold leading-relaxed">
              ひとりで立ち上がれるようになり、めまいやだるさが完全に消えてから作業に戻ってください。少しでも不安がある場合は上長へ連絡してください。
            </p>
          )}
        </div>

        <div className="mt-auto space-y-2.5">
          {stage === 'alert' ? (
            <>
              <ActionButton variant="alert-white" icon={Droplets} onClick={() => onStageChange('resting')}>
                水分を摂り、休憩に入りました
              </ActionButton>
              <ActionButton variant="amber" icon={PhoneCall}>
                緊急連絡（工事課員へ直通電話）
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
    </PhoneFrame>
  )
}
