'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, MessageSquareWarning } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { LangSelect, type Lang } from '@/components/showcase/phone-header'
import { ActionButton } from '@/components/heatguard/mobile-ui'
import { ReminderBox, WeatherCard } from '@/components/heatguard/daytime/worker-home-screen'

export function ManagerHomeScreen({ onOpenResponse }: { onOpenResponse: () => void }) {
  const [lang, setLang] = useState<Lang>('JP')

  return (
    <PhoneFrame label="A-01 管理者ホーム画面" time="14:30" className="bg-canvas text-ink">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-canvas px-5 py-3">
        <p className="type-label min-w-0 leading-snug">
          <span className="type-meta font-normal">〇〇鉄筋工業｜</span>
          <span className="whitespace-nowrap">職長：鈴木 一郎</span>
        </p>
        <LangSelect value={lang} onChange={setLang} compact />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-canvas px-4 pt-3 pb-4">
        <div role="status" className="rounded-2xl bg-white p-3">
          <p className="type-label flex items-center gap-2">
            <MessageSquareWarning className="size-5 shrink-0 text-[#5B5FC7]" aria-hidden />
            Microsoft Teams｜熱中症アラート通知
          </p>
          <p className="type-body mt-1 pl-7">
            〇〇鉄筋工業 グエン・ヴァンさんに危険アラートが発生しました（14:25 めまい申告）
          </p>
        </div>

        <div className="rounded-lg bg-red-600 p-4 text-white">
          <p className="text-base font-bold">担当班でアラートが発生しています</p>
          <p className="mt-1 text-sm">対象者：グエン・ヴァン（発生から 5分経過・未対応）</p>
          <button
            type="button"
            onClick={onOpenResponse}
            className="type-button mt-3 flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-lg bg-white text-red-700 transition-colors hover:bg-red-50"
          >
            対応画面を開く
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        <p className="type-label mt-1">自分の定時チェック・現場気象</p>
        <ReminderBox />
        <WeatherCard />

        <div className="mt-auto pt-1">
          <ActionButton icon={CheckCircle2}>定時チェックへ進む</ActionButton>
        </div>
      </div>
    </PhoneFrame>
  )
}
