'use client'

import { AlertOctagon, UserCheck } from 'lucide-react'
import { ActionButton } from '@/components/heatguard/mobile-ui'

type EntryBlockModalProps = {
  findings: string[]
  onResolve?: () => void
}

export function EntryBlockModal({ findings, onResolve }: EntryBlockModalProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-center bg-slate-900/40 px-4">
      <div
        role="alertdialog"
        aria-labelledby="entry-block-title"
        className="rounded-lg border-t-4 border-red-600 bg-white px-5 pt-5 pb-4 shadow-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <h2 id="entry-block-title" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <AlertOctagon className="size-6 shrink-0 text-red-600" aria-hidden />
          入場ストップ（要・上長確認）
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          以下の項目が安全基準を超過しているため、作業開始前に職長または現場監督の対面確認を受けてください。
        </p>

        <ul className="mt-3 space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {findings.map((f) => (
            <li key={f}>・{f}</li>
          ))}
        </ul>

        <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm leading-relaxed text-slate-700">
          担当職長（鈴木 一郎）へ自動通知しました。詰所にて待機してください。
        </p>

        <div className="mt-4 space-y-2">
          <ActionButton variant="ink" icon={UserCheck} onClick={onResolve}>
            上長確認済（面談後に押下で解除）
          </ActionButton>
          <p className="text-center text-xs text-slate-400">※対面での状態確認後、職長または監督が操作してください</p>
        </div>
      </div>
    </div>
  )
}
